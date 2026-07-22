const WORLD = "ISOLATED";
const CAPTURE_FILE = "capture.js";
const RUNNER_FILE = "runner.js";
const TOOLBAR_FILE = "inpage-toolbar.js";
const SVG_GRABBER_FILE = "svg-grabber.js";
const FONT_INSPECTOR_FILE = "font-inspector.js";
const SVG_SANITIZER_FILE = "svg-sanitizer.js";
const OPENTYPE_FILE = "lib/opentype.min.js";

const FIGMA_CAPTURE_CONCURRENCY_KEY = "proxyFetchConcurrency";
const FIGMA_CAPTURE_ALLOWED_CONCURRENCY = new Set([4, 6, 8, 10, 12, 16, 20]);
const FIGMA_CAPTURE_DEFAULT_CONCURRENCY = 8;
const FIGMA_CAPTURE_PROXY_SESSION_KEY = "figmaCaptureProxyAssetCacheV1";
const FIGMA_CAPTURE_PROXY_DIAG_KEY = "figmaCaptureProxyDiagnosticsV1";
const FIGMA_CAPTURE_PROXY_MAX_DIAG = 500;
const FIGMA_CAPTURE_FETCH_TIMEOUT_MS = 8000;

const figmaProxyQueue = [];
const figmaProxyInFlight = new Map();
const figmaProxyMemCache = new Map();
let figmaProxyActive = 0;
let figmaProxyMaxConcurrency = FIGMA_CAPTURE_DEFAULT_CONCURRENCY;
let figmaProxySessionLoaded = false;
let figmaProxySessionCache = {};
let figmaProxyDiagnostics = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function injectScriptFile(tabId, file) {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: WORLD,
    files: [file],
  });
}

// Same flow as the master branch: always (re)inject capture.js and give it
// a moment to attach `window.figma` before running the capture. No "is it
// already loaded" probe — that extra round-trip was the source of capture
// failures when its detection didn't match reality.
async function runCapture(tabId, selector = "body", autoScroll = true) {
  await injectScriptFile(tabId, OPENTYPE_FILE);
  await injectScriptFile(tabId, SVG_SANITIZER_FILE);
  await injectScriptFile(tabId, CAPTURE_FILE);
  await sleep(300);

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    world: WORLD,
    args: [selector, autoScroll],
    func: async (sel, shouldScroll) => {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      if (!window.figma?.captureForDesign) {
        throw new Error(
          "window.figma.captureForDesign is not available. capture.js may not have loaded."
        );
      }

      // Inject temporary CSS to hide scrollbars so layout width matches viewport width exactly (Figma DevTools style)
      const hideScrollbarStyle = document.createElement("style");
      hideScrollbarStyle.id = "__figma_hide_scrollbar_temp__";
      hideScrollbarStyle.textContent = "::-webkit-scrollbar { width: 0px !important; height: 0px !important; display: none !important; }";
      document.documentElement.appendChild(hideScrollbarStyle);

      if (sel === "body" && shouldScroll) {
        const scrollStep = Math.max(400, Math.floor(window.innerHeight * 0.8));
        const maxScrollLimit = 30000; // Cap to prevent infinite scrolling pages
        for (let y = 0; y < Math.min(document.body.scrollHeight, maxScrollLimit); y += scrollStep) {
          window.scrollTo(0, y);
          await delay(400);
        }
        await delay(1500);
        window.scrollTo(0, 0);

        const images = Array.from(document.images || []);
        await Promise.allSettled(
          images.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.addEventListener("load", resolve, { once: true });
                  img.addEventListener("error", resolve, { once: true });
                  setTimeout(resolve, 10000);
                })
          )
        );

        if (document.fonts?.ready) {
          await Promise.race([document.fonts.ready, delay(3000)]);
        }

        await delay(1000);
      }

      try {
        const MAX_SIZE = 100 * 1024;
        for (const img of Array.from(document.images || [])) {
          if (!img.src || img.src.startsWith('data:')) continue;
          if (img.complete && img.naturalWidth > 0 && (img.naturalWidth * img.naturalHeight * 4 < MAX_SIZE * 3)) {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/png');
              if (dataUrl.length < MAX_SIZE * 1.3) {
                 img.dataset.originalSrc = img.src;
                 img.src = dataUrl;
              }
            } catch (e) {}
          }
        }
      } catch (e) {
        console.warn("Base64 conversion failed", e);
      }

      // ROOT CAUSE: capture.js's Te() uses the same HOST_ID constant to locate
      // our shadow DOM host, then replaces our .wrapper-outer content with its own
      // "正在将页面捕获到剪贴板" UI. MutationObserver on document.body doesn't help
      // because the mutation happens INSIDE our shadow root, not in the light DOM.
      //
      // Fix: observe our shadow wrapper directly. When capture.js overwrites it
      // (detectable by data-toolbar-role appearing), immediately restore our content.
      const ownHostId = "__figma_capture_toolbar_host__";
      const shadowHost = document.getElementById(ownHostId);
      const shadowWrapper = shadowHost?.shadowRoot?.querySelector(".wrapper-outer");

      let shadowObserver = null;
      if (shadowWrapper) {
        const goodHTML = shadowWrapper.innerHTML;
        const goodWidth = shadowWrapper.style.width;
        const goodHeight = shadowWrapper.style.height;

        shadowObserver = new MutationObserver(() => {
          // capture.js replaced our content — restore the capturing spinner
          if (shadowWrapper.querySelector("[data-toolbar-role]") ||
              !shadowWrapper.querySelector(".spinner")) {
            shadowWrapper.innerHTML = goodHTML;
            shadowWrapper.style.width = goodWidth;
            shadowWrapper.style.height = goodHeight;
          }
        });
        shadowObserver.observe(shadowWrapper, { childList: true, subtree: true });
      }

      // Secondary defence: also clean up any light-DOM elements capture.js adds
      const existingBodyChildren = new Set(Array.from(document.body?.children ?? []));
      const existingHtmlChildren = new Set(Array.from(document.documentElement?.children ?? []));

      const removeLightDomUi = () => {
        Array.from(document.body?.children ?? []).forEach(child => {
          if (child.id === ownHostId || existingBodyChildren.has(child)) return;
          child.remove();
        });
        Array.from(document.documentElement?.children ?? []).forEach(child => {
          if (child === document.head || child === document.body) return;
          if (existingHtmlChildren.has(child)) return;
          child.remove();
        });
        document.querySelectorAll("[data-toolbar-role]").forEach(el => {
          let root = el;
          while (root.parentElement && root.parentElement !== document.documentElement) {
            root = root.parentElement;
          }
          if (root.id !== ownHostId && document.documentElement.contains(root)) {
            root.remove();
          }
        });
      };

      const lightObserver = new MutationObserver(removeLightDomUi);
      lightObserver.observe(document.documentElement, { childList: true, subtree: true });
      const sweepInterval = setInterval(removeLightDomUi, 120);

      // If auto scroll is OFF, hide elements below the fold to only capture the current screen/viewport
      const hiddenElements = [];
      if (sel === "body" && !shouldScroll) {
        const hostId = "__figma_capture_toolbar_host__";
        const allElements = document.body.querySelectorAll('*');
        const viewportHeight = window.innerHeight;
        
        for (const el of allElements) {
          // Skip the toolbar host itself and its children
          if (el.id === hostId || el.closest(`#${hostId}`)) {
            continue;
          }
          
          try {
            const rect = el.getBoundingClientRect();
            // If the element starts completely below the fold, hide it
            if (rect.top >= viewportHeight) {
              hiddenElements.push({
                el: el,
                originalDisplay: el.style.display
              });
              el.style.setProperty('display', 'none', 'important');
            }
          } catch (e) {}
        }
        // Give a tiny moment for layout reflow after hiding elements
        await delay(50);
      }

      // Allow DOM mutations to settle before capture
      let cleanupSanitizer = null;
      if (typeof window.figmaRunSVGSanitizer === "function") {
        try {
          cleanupSanitizer = await window.figmaRunSVGSanitizer();
        } catch(e) {
          console.error("Sanitizer failed:", e);
        }
      }

      // silent: true skips clipboard write and success UI inside capture.js.
      const res = await window.figma.captureForDesign({ selector: sel, silent: true });

      // Run cleanup from sanitizer
      if (cleanupSanitizer) {
        try {
          cleanupSanitizer();
        } catch(e) {}
      }

      // Restore hidden elements immediately
      for (const item of hiddenElements) {
        try {
          item.el.style.display = item.originalDisplay;
        } catch (e) {}
      }

      // Allow async DOM mutations to settle, then stop all cleanup machinery
      await new Promise(r => setTimeout(r, 200));
      if (shadowObserver) shadowObserver.disconnect();
      clearInterval(sweepInterval);
      lightObserver.disconnect();
      removeLightDomUi(); // final sweep

      // Cleanup temporary scrollbar styles
      const tempStyle = document.getElementById("__figma_hide_scrollbar_temp__");
      if (tempStyle) tempStyle.remove();

      if (sel !== "body") {
        try {
          const el = document.querySelector(sel);
          if (el && el.hasAttribute("data-figma-temp-selector")) {
            el.removeAttribute("data-figma-temp-selector");
          }
        } catch (e) {
          console.error("Failed to clean temporary selector:", e);
        }
      }

      // Write to clipboard in page context (avoids large sendMessage limits).
      //
      // Figma's paste handler requires text/html with a specific marker format —
      // it does NOT read plain text JSON. Replicate capture.js's He() function:
      //   <span data-h2d="<!--(figh2d)BASE64(/figh2d)-->"></span>
      // where BASE64 is the UTF-8 encoded JSON read as a data URL via FileReader.
      const jsonStr = typeof res === "string" ? res : JSON.stringify(res);

      const base64DataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(
          new File([new TextEncoder().encode(jsonStr)], "", { type: "application/octet-stream" })
        );
      });
      const base64 = base64DataUrl.slice(base64DataUrl.indexOf(",") + 1);
      const htmlBlob = new Blob(
        [`<span data-h2d="<!--(figh2d)${base64}(/figh2d)-->"></span>`],
        { type: "text/html" }
      );
      await navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob })]);

      // Return a lightweight sentinel — the full JSON stays in the page.
      return { ok: true };
    }
  });
  return result;
}

const OFFSCREEN_URL = "offscreen.html";
let creatingOffscreenDocument = null;

async function ensureOffscreenDocument() {
  const existing = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)],
  });
  if (existing.length > 0) return;

  if (!creatingOffscreenDocument) {
    creatingOffscreenDocument = chrome.offscreen
      .createDocument({
        url: OFFSCREEN_URL,
        reasons: ["CLIPBOARD"],
        justification: "Write the captured design JSON to the clipboard so it can be pasted into Figma.",
      })
      .finally(() => {
        creatingOffscreenDocument = null;
      });
  }
  await creatingOffscreenDocument;
}

// Clipboard writes from a content script require the tab's document to be
// focused. Users capture, then switch focus straight to Figma to paste - the
// tab never regains focus, so that write would fail. An offscreen document
// is not subject to that focus requirement, so do the write there instead.
async function copyToClipboard(text) {
  await ensureOffscreenDocument();
  const response = await chrome.runtime.sendMessage({ type: "FIGMA_OFFSCREEN_COPY", text });
  if (!response?.ok) {
    throw new Error(response?.error || "Offscreen clipboard write failed");
  }
}

function saveResult(resultOrJson) {
  try {
    const text = typeof resultOrJson === "string" ? resultOrJson : JSON.stringify(resultOrJson, null, 2);
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const url = "data:application/json;base64," + base64;
    const filename = `figma-capture-${Date.now()}.json`;
    chrome.downloads.download({ url, filename, saveAs: true });
  } catch (err) {
    console.error("Failed to download file:", err);
  }
}

function normalizeConcurrency(value) {
  if (value === "infinite" || value === "∞") {
    return Number.POSITIVE_INFINITY;
  }
  const numeric = Number(value);
  if (FIGMA_CAPTURE_ALLOWED_CONCURRENCY.has(numeric)) {
    return numeric;
  }
  return FIGMA_CAPTURE_DEFAULT_CONCURRENCY;
}

function concurrencyLabel() {
  return Number.isFinite(figmaProxyMaxConcurrency)
    ? String(figmaProxyMaxConcurrency)
    : "infinite";
}

async function loadConcurrencyConfig() {
  try {
    const data = await chrome.storage.local.get({
      [FIGMA_CAPTURE_CONCURRENCY_KEY]: String(FIGMA_CAPTURE_DEFAULT_CONCURRENCY),
    });
    figmaProxyMaxConcurrency = normalizeConcurrency(
      data?.[FIGMA_CAPTURE_CONCURRENCY_KEY]
    );
  } catch {
    figmaProxyMaxConcurrency = FIGMA_CAPTURE_DEFAULT_CONCURRENCY;
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area !== "local" ||
    !changes ||
    !changes[FIGMA_CAPTURE_CONCURRENCY_KEY]
  ) {
    return;
  }
  figmaProxyMaxConcurrency = normalizeConcurrency(
    changes[FIGMA_CAPTURE_CONCURRENCY_KEY].newValue
  );
  pumpProxyQueue();
});

function pushDiag(entry) {
  figmaProxyDiagnostics.push({ ts: Date.now(), ...entry });
  if (figmaProxyDiagnostics.length > FIGMA_CAPTURE_PROXY_MAX_DIAG) {
    figmaProxyDiagnostics = figmaProxyDiagnostics.slice(-FIGMA_CAPTURE_PROXY_MAX_DIAG);
  }
  if (chrome?.storage?.session) {
    chrome.storage.session
      .set({ [FIGMA_CAPTURE_PROXY_DIAG_KEY]: figmaProxyDiagnostics })
      .catch(() => {});
  }
}

async function loadProxySession() {
  if (figmaProxySessionLoaded) return;
  figmaProxySessionLoaded = true;
  if (!chrome?.storage?.session) return;
  try {
    const data = await chrome.storage.session.get({
      [FIGMA_CAPTURE_PROXY_SESSION_KEY]: {},
      [FIGMA_CAPTURE_PROXY_DIAG_KEY]: [],
    });
    figmaProxySessionCache = data?.[FIGMA_CAPTURE_PROXY_SESSION_KEY] || {};
    figmaProxyDiagnostics = Array.isArray(data?.[FIGMA_CAPTURE_PROXY_DIAG_KEY])
      ? data[FIGMA_CAPTURE_PROXY_DIAG_KEY]
      : [];
  } catch {
    figmaProxySessionCache = {};
    figmaProxyDiagnostics = [];
  }
}

async function persistProxySession() {
  if (!chrome?.storage?.session) return;
  try {
    await chrome.storage.session.set({
      [FIGMA_CAPTURE_PROXY_SESSION_KEY]: figmaProxySessionCache,
      [FIGMA_CAPTURE_PROXY_DIAG_KEY]: figmaProxyDiagnostics,
    });
  } catch {
    // no-op
  }
}

function enqueueProxyTask(task) {
  return new Promise((resolve, reject) => {
    figmaProxyQueue.push({ task, resolve, reject });
    pumpProxyQueue();
  });
}

function pumpProxyQueue() {
  while (figmaProxyActive < figmaProxyMaxConcurrency && figmaProxyQueue.length) {
    const item = figmaProxyQueue.shift();
    figmaProxyActive++;
    Promise.resolve()
      .then(item.task)
      .then(item.resolve, item.reject)
      .finally(() => {
        figmaProxyActive--;
        pumpProxyQueue();
      });
  }
}

function toBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function proxyFetchAsset(url) {
  await loadProxySession();

  const fromMemory = figmaProxyMemCache.get(url);
  if (fromMemory) {
    pushDiag({ url, phase: "proxy-cache-memory", ok: true, status: 200 });
    return { ok: true, status: 200, cacheHit: "memory", ...fromMemory };
  }

  const fromSession = figmaProxySessionCache[url];
  if (fromSession) {
    figmaProxyMemCache.set(url, fromSession);
    pushDiag({ url, phase: "proxy-cache-session", ok: true, status: 200 });
    return { ok: true, status: 200, cacheHit: "session", ...fromSession };
  }

  if (figmaProxyInFlight.has(url)) {
    return figmaProxyInFlight.get(url);
  }

  const promise = enqueueProxyTask(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FIGMA_CAPTURE_FETCH_TIMEOUT_MS);
      let response;
      try {
        response = await fetch(url, {
          credentials: "omit",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) {
        pushDiag({
          url,
          phase: "proxy-fetch",
          ok: false,
          status: response.status,
          error: `HTTP_${response.status}`,
        });
        return { ok: false, status: response.status, error: `HTTP_${response.status}` };
      }

      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const base64 = toBase64(await response.arrayBuffer());
      const payload = { contentType, base64 };
      figmaProxyMemCache.set(url, payload);
      figmaProxySessionCache[url] = payload;
      persistProxySession();
      pushDiag({
        url,
        phase: "proxy-fetch",
        ok: true,
        status: response.status,
        bytes: base64.length,
      });

      return {
        ok: true,
        status: response.status,
        contentType,
        base64,
        cacheHit: "miss",
      };
    } catch (error) {
      const message = String(error);
      pushDiag({ url, phase: "proxy-fetch", ok: false, status: 0, error: message });
      return { ok: false, status: 0, error: message };
    }
  }).finally(() => {
    figmaProxyInFlight.delete(url);
  });

  figmaProxyInFlight.set(url, promise);
  return promise;
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await injectScriptFile(tab.id, TOOLBAR_FILE);
  } catch (error) {
    console.error("Toolbar inject failed:", error);
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || msg.type !== "FIGMA_RUN_SVG_GRABBER") return;
  const tabId = sender.tab?.id || msg.tabId;
  if (!tabId) return;
  injectScriptFile(tabId, SVG_GRABBER_FILE).catch((error) => {
    console.error("SVG grabber inject failed:", error);
  });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || msg.type !== "FIGMA_RUN_FONT_INSPECTOR") return;
  const tabId = sender.tab?.id || msg.tabId;
  if (!tabId) return;
  injectScriptFile(tabId, FONT_INSPECTOR_FILE).then(() => {
    chrome.scripting.executeScript({
      target: { tabId },
      world: WORLD,
      func: () => window.figmaFontInspector?.toggle()
    });
  }).catch((error) => {
    console.error("Font inspector inject failed:", error);
  });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || (msg.type !== "FIGMA_RUN_ENTIRE_SCREEN_CAPTURE" && msg.type !== "FIGMA_RUN_ELEMENT_CAPTURE")) return;
  (async () => {
    const tabId = sender.tab?.id || msg.tabId;
    let originalWindow = null;
    let windowIdToRestore = null;
    try {
      if (!tabId) {
        throw new Error("No tab context for message");
      }

      chrome.tabs.sendMessage(tabId, { type: "FIGMA_CAPTURE_STATE", state: "capturing" }).catch(() => {});

      const isEntireScreen = msg.type === "FIGMA_RUN_ENTIRE_SCREEN_CAPTURE";
      
      if (isEntireScreen && msg.viewport) {
        // Reset zoom to 100% to guarantee layout accuracy
        try {
          await chrome.tabs.setZoom(tabId, 1.0);
        } catch (zoomErr) {
          console.warn("Failed to reset zoom level:", zoomErr);
        }

        try {
          const tab = await chrome.tabs.get(tabId);
          windowIdToRestore = tab.windowId;
          originalWindow = await chrome.windows.get(tab.windowId);
          
          await chrome.windows.update(tab.windowId, {
            state: "normal",
            width: msg.viewport.width,
            height: Math.max(msg.viewport.height, 600)
          });
        } catch (e) {
          console.warn("Failed to resize window:", e);
        }

        // Wait for CSS layout rules and media queries to reflow
        await sleep(500);

        // Perform capture in emulator context
        const captureResult = await runCapture(tabId, "body", msg.autoScroll !== false);
        if (!captureResult?.ok) {
          throw new Error("Capture or clipboard write failed in resized window mode");
        }
      } else {
        const selector = isEntireScreen ? "body" : msg.selector;
        const result = await runCapture(tabId, selector, msg.autoScroll !== false);
        if (!result?.ok) {
          throw new Error("Capture or clipboard write failed in page context");
        }
      }

      await chrome.tabs.sendMessage(tabId, { type: "FIGMA_CAPTURE_STATE", state: "success", delivery: "clipboard" }).catch(() => {});
    } catch (error) {
      console.error("Capture failed:", error);
      if (tabId) {
        await chrome.tabs.sendMessage(tabId, { type: "FIGMA_CAPTURE_STATE", state: "error" }).catch(() => {});
      }
    } finally {
      if (originalWindow && windowIdToRestore) {
        try {
          const restoreProps = { state: originalWindow.state };
          if (originalWindow.state === "normal") {
            restoreProps.width = originalWindow.width;
            restoreProps.height = originalWindow.height;
            restoreProps.top = originalWindow.top;
            restoreProps.left = originalWindow.left;
          }
          await chrome.windows.update(windowIdToRestore, restoreProps);
        } catch (e) {
          console.warn("Failed to restore window:", e);
        }
      }
    }
  })();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "FIGMA_CAPTURE_FETCH_ASSET" || !msg.url) return;
  (async () => {
    const result = await proxyFetchAsset(msg.url);
    sendResponse({
      ...result,
      diagnostics: {
        phase: "proxy",
        cacheHit: result.cacheHit || null,
        queueDepth: figmaProxyQueue.length,
        activeRequests: figmaProxyActive,
        maxConcurrency: concurrencyLabel(),
      },
    });
  })();
  return true;
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "FIGMA_CAPTURE_GET_DIAGNOSTICS") return;
  (async () => {
    await loadProxySession();
    sendResponse({
      ok: true,
      diagnostics: {
        generatedAt: new Date().toISOString(),
        queueDepth: figmaProxyQueue.length,
        activeRequests: figmaProxyActive,
        inFlight: figmaProxyInFlight.size,
        maxConcurrency: concurrencyLabel(),
        failures: figmaProxyDiagnostics.filter((x) => x && x.ok === false),
      },
    });
  })();
  return true;
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "FIGMA_DOWNLOAD_FILE" || !msg.url) return;
  chrome.downloads.download({
    url: msg.url,
    filename: msg.filename || "font.woff2",
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error("Font download failed:", chrome.runtime.lastError.message);
      sendResponse({ ok: false, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ ok: true, downloadId });
    }
  });
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enableAssetProxyFetch: true,
    proxyFetchConcurrency: "8"
  });
});

loadConcurrencyConfig();

