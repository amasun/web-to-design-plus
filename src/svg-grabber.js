(() => {
  const HOST_ID = "__figma_svg_grabber_host__";
  const TOOLBAR_HOST_ID = "__figma_capture_toolbar_host__";
  const MAX_ICONS = 300;
  const BG_SCAN_CHUNK_SIZE = 800;
  const IMG_FETCH_CONCURRENCY = 6;

  const ICON_TITLE = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.2887 9.00525C9.1505 9.19475 8.10931 9.76218 7.33312 10.616C6.55693 11.4698 6.09101 12.5602 6.01052 13.7113M13.7113 9.00525C14.8495 9.19475 15.8907 9.76218 16.6669 10.616C17.4431 11.4698 17.909 12.5602 17.9895 13.7113M10.2887 8.57743H5.15488M5.15488 8.57743C5.15488 8.80436 5.06474 9.02199 4.90427 9.18246C4.74381 9.34292 4.52617 9.43307 4.29924 9.43307C4.07231 9.43307 3.85468 9.34292 3.69421 9.18246C3.53375 9.02199 3.4436 8.80436 3.4436 8.57743C3.4436 8.3505 3.53375 8.13286 3.69421 7.9724C3.85468 7.81194 4.07231 7.72179 4.29924 7.72179C4.52617 7.72179 4.74381 7.81194 4.90427 7.9724C5.06474 8.13286 5.15488 8.3505 5.15488 8.57743ZM18.8451 8.57743H13.7113M18.8451 8.57743C18.8451 8.80436 18.9353 9.02199 19.0957 9.18246C19.2562 9.34292 19.4738 9.43307 19.7008 9.43307C19.9277 9.43307 20.1453 9.34292 20.3058 9.18246C20.4662 9.02199 20.5564 8.80436 20.5564 8.57743C20.5564 8.3505 20.4662 8.13286 20.3058 7.9724C20.1453 7.81194 19.9277 7.72179 19.7008 7.72179C19.4738 7.72179 19.2562 7.81194 19.0957 7.9724C18.9353 8.13286 18.8451 8.3505 18.8451 8.57743ZM4.29924 14.5669C4.29924 14.34 4.38939 14.1223 4.54985 13.9619C4.71032 13.8014 4.92795 13.7113 5.15488 13.7113H6.86616C7.09309 13.7113 7.31073 13.8014 7.47119 13.9619C7.63165 14.1223 7.7218 14.34 7.7218 14.5669V16.2782C7.7218 16.5051 7.63165 16.7228 7.47119 16.8832C7.31073 17.0437 7.09309 17.1338 6.86616 17.1338H5.15488C4.92795 17.1338 4.71032 17.0437 4.54985 16.8832C4.38939 16.7228 4.29924 16.5051 4.29924 16.2782V14.5669ZM16.2782 14.5669C16.2782 14.34 16.3683 14.1223 16.5288 13.9619C16.6893 13.8014 16.9069 13.7113 17.1338 13.7113H18.8451C19.072 13.7113 19.2897 13.8014 19.4501 13.9619C19.6106 14.1223 19.7008 14.34 19.7008 14.5669V16.2782C19.7008 16.5051 19.6106 16.7228 19.4501 16.8832C19.2897 17.0437 19.072 17.1338 18.8451 17.1338H17.1338C16.9069 17.1338 16.6893 17.0437 16.5288 16.8832C16.3683 16.7228 16.2782 16.5051 16.2782 16.2782V14.5669ZM10.2887 7.72179C10.2887 7.49486 10.3789 7.27722 10.5393 7.11676C10.6998 6.9563 10.9174 6.86615 11.1444 6.86615H12.8556C13.0826 6.86615 13.3002 6.9563 13.4607 7.11676C13.6211 7.27722 13.7113 7.49486 13.7113 7.72179V9.43307C13.7113 9.66 13.6211 9.87763 13.4607 10.0381C13.3002 10.1986 13.0826 10.2887 12.8556 10.2887H11.1444C10.9174 10.2887 10.6998 10.1986 10.5393 10.0381C10.3789 9.87763 10.2887 9.66 10.2887 9.43307V7.72179Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_CLOSE = `<svg width="14" height="14" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_COPY = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const ICON_DOWNLOAD = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 14a5 5 0 0 1 0-7.07l1-1a5 5 0 0 1 7.07 7.07l-1 1M14 10a5 5 0 0 1 0 7.07l-1 1a5 5 0 0 1-7.07-7.07l1-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12.5 9.5 17 19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_ERROR = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_SUN = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const ICON_MOON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  const iconsByHash = new Map();
  const fallbacksByUrl = new Map();
  const spriteCache = new Map();
  const selectedIds = new Set();
  let activeCardId = null;
  let allIcons = [];
  let allFallbacks = [];
  let anonymousCounter = 0;
  let truncatedCount = 0;
  let filterText = "";
  let sortAsc = true;

  function ensureFontsLoaded() {
    const fontId = "__figma_fonts__";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
      document.head.appendChild(link);
    }
  }

  function idleYield() {
    return new Promise((resolve) => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => resolve(), { timeout: 50 });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }
  const escapeAttr = escapeHtml;

  function isSvgSrc(src) {
    if (!src) return false;
    if (src.startsWith("data:image/svg+xml")) return true;
    const clean = src.split("?")[0].split("#")[0];
    return clean.toLowerCase().endsWith(".svg");
  }

  function decodeDataUriSvg(src) {
    try {
      const comma = src.indexOf(",");
      const meta = src.slice(5, comma);
      const data = src.slice(comma + 1);
      return meta.includes("base64") ? decodeURIComponent(escape(atob(data))) : decodeURIComponent(data);
    } catch (e) {
      return null;
    }
  }

  async function fetchSvgText(url) {
    try {
      const res = await fetch(url, { credentials: "omit" });
      if (!res.ok) return null;
      const text = await res.text();
      return /<svg[\s>]/i.test(text) ? text.trim() : null;
    } catch (e) {
      return null;
    }
  }

  function filenameFromUrl(url) {
    try {
      const clean = url.split("?")[0].split("#")[0];
      const parts = clean.split("/");
      return decodeURIComponent(parts[parts.length - 1] || "icon");
    } catch (e) {
      return "icon";
    }
  }

  const GENERIC_ID_PATTERN = /^(?:mask|clip|paint|filter|grad|gradient|path|layer|svg|icon|group|g|def|defs|symbol|image|pattern|marker)[0-9a-z_-]*$/i;

  function extractSemanticName(str) {
    if (!str || typeof str !== "string") return null;
    const parts = str.split(/__|::|:/);
    for (const part of parts) {
      let cleaned = part.trim();
      cleaned = cleaned.replace(/[_-]?(?:mask|clip|paint|filter|grad|gradient|path|layer)[0-9a-f_-]*$/i, "");
      if (cleaned.length >= 3 && cleaned.length <= 40 && !GENERIC_ID_PATTERN.test(cleaned) && !/^[0-9a-f_-]+$/i.test(cleaned)) {
        return cleaned;
      }
    }
    return null;
  }

  function extractAdjacentTextLabel(el) {
    if (!el) return null;

    function isValidTextLabel(txt) {
      if (!txt || typeof txt !== "string") return false;
      const cleaned = txt.replace(/\s+/g, " ").trim();
      if (cleaned.length < 2 || cleaned.length > 28) return false;
      const words = cleaned.split(" ");
      if (words.length > 5) return false;
      if (!/[a-zA-Z0-9\u4e00-\u9fa5]/.test(cleaned)) return false;
      return cleaned;
    }

    // 1. Check parent interactive wrapper (<button>, <a>, <label>, <li>, or role="button")
    const interactiveParent = el.closest && el.closest("button, a, label, li, [role='button'], [role='menuitem'], [role='tab'], [role='link']");
    if (interactiveParent && interactiveParent !== el) {
      const valid = isValidTextLabel(interactiveParent.textContent);
      if (valid) return valid;
    }

    // 2. Check direct parent element textContent if parent only has a few children (e.g. badge, chip, flex row)
    const parent = el.parentElement;
    if (parent && parent.children.length <= 3) {
      const valid = isValidTextLabel(parent.textContent);
      if (valid) return valid;
    }

    // 3. Check immediately next sibling element (e.g. <svg /> <span>Skill</span>)
    if (el.nextElementSibling) {
      const valid = isValidTextLabel(el.nextElementSibling.textContent);
      if (valid) return valid;
    }

    // 4. Check immediately previous sibling element (e.g. <span>Skill</span> <svg />)
    if (el.previousElementSibling) {
      const valid = isValidTextLabel(el.previousElementSibling.textContent);
      if (valid) return valid;
    }

    return null;
  }

  function elementLabel(el) {
    if (!el || !el.getAttribute) return "";

    // 1. Explicit accessibility or data attributes on the SVG element
    const aria = el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("data-icon") || el.getAttribute("data-lucide") || el.getAttribute("data-name");
    if (aria && aria.trim()) return aria.trim();

    // 2. <title> tag inside the SVG
    const titleEl = el.querySelector && el.querySelector("title");
    if (titleEl && titleEl.textContent.trim()) return titleEl.textContent.trim();

    // 3. Known icon framework class patterns (e.g., lucide-brain, fa-user, bi-search, tabler-icon-heart, icon-settings)
    const clsAttr = el.getAttribute("class");
    if (clsAttr && typeof clsAttr === "string") {
      const classes = clsAttr.split(/\s+/);
      for (const cls of classes) {
        const match = /^(?:lucide|tabler-icon|bi|fa|icon|i)-([a-z0-9_-]+)$/i.exec(cls);
        if (match && match[1] && match[1] !== "icon" && match[1] !== "svg") {
          return cls; // e.g., "lucide-brain", "fa-user", "icon-search"
        }
      }
    }

    // 4. Check internal semantic IDs / data-name inside the SVG tree (e.g. <mask id="nextjs_icon_dark__:r8:mask0..."> or <g id="Logo_Nextjs">)
    const selfName = extractSemanticName(el.getAttribute("data-name")) || extractSemanticName(el.getAttribute("id"));
    if (selfName) return selfName;

    if (el.querySelectorAll) {
      const innerNodes = el.querySelectorAll("[id], [data-name]");
      for (const node of innerNodes) {
        const found = extractSemanticName(node.getAttribute("data-name")) || extractSemanticName(node.getAttribute("id"));
        if (found) return found;
      }
    }

    // 5. Check parent wrapper / button / link for aria-label or title (e.g., <button aria-label="Copy"> <svg/> </button>)
    const parent = el.closest && el.closest("button[aria-label], a[aria-label], [title], [data-icon], [data-lucide]");
    if (parent && parent !== el) {
      const parentLabel = parent.getAttribute("aria-label") || parent.getAttribute("title") || parent.getAttribute("data-icon") || parent.getAttribute("data-lucide");
      if (parentLabel && parentLabel.trim().length <= 36) {
        return parentLabel.trim();
      }
    }

    // 6. Check adjacent sibling or small wrapper text context (e.g., <button><svg /> Skill</button> or <div><svg /><span>Skill</span></div>)
    const adjacentText = extractAdjacentTextLabel(el);
    if (adjacentText) return adjacentText;

    return "";
  }

  function serializeSvg(svgEl) {
    try {
      const clone = svgEl.cloneNode(true);
      if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      return clone.outerHTML;
    } catch (e) {
      return null;
    }
  }

  // Strip volatile id/class/style/size attrs before hashing so the same icon
  // repeated across a page (list rows, nav items) collapses into one card.
  function hashMarkup(markup) {
    const normalized = markup
      .replace(/\sid="[^"]*"/g, "")
      .replace(/\sclass="[^"]*"/g, "")
      .replace(/\sstyle="[^"]*"/g, "")
      .replace(/\swidth="[^"]*"/g, "")
      .replace(/\sheight="[^"]*"/g, "")
      .replace(/\s+/g, " ")
      .trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
    return `h${hash}_${normalized.length}`;
  }

  function registerIcon(markup, meta, originalSvgEl = null) {
    if (!markup) return;
    const hash = hashMarkup(markup);
    const existing = iconsByHash.get(hash);
    if (existing) {
      existing.count++;
      return;
    }
    if (iconsByHash.size >= MAX_ICONS) {
      truncatedCount++;
      return;
    }
    const label = (meta.label || "").trim() || `icon-${++anonymousCounter}`;
    iconsByHash.set(hash, { id: hash, markup, count: 1, source: meta.source, label, originalEl: originalSvgEl });
  }

  function registerFallback(meta) {
    const key = meta.originalUrl;
    const existing = fallbacksByUrl.get(key);
    if (existing) {
      existing.count++;
      return;
    }
    const label = (meta.label || "").trim() || filenameFromUrl(key);
    fallbacksByUrl.set(key, { id: `f_${fallbacksByUrl.size}`, count: 1, isFallback: true, source: meta.source, originalUrl: key, label });
  }

  function isIgnoredElement(el) {
    if (!el) return false;
    let curr = el;
    while (curr) {
      if (curr.id === HOST_ID || curr.id === TOOLBAR_HOST_ID) return true;
      if (curr.getAttribute && curr.getAttribute("data-figma-capture-ignore")) return true;
      if (curr.classList && (curr.classList.contains("wrapper-outer") || curr.classList.contains("sg-wrapper") || curr.classList.contains("sg-panel"))) return true;
      if (curr.getRootNode) {
        const rootNode = curr.getRootNode();
        if (rootNode && rootNode.host) {
          if (rootNode.host.id === HOST_ID || rootNode.host.id === TOOLBAR_HOST_ID || rootNode.host.getAttribute("data-figma-capture-ignore")) {
            return true;
          }
        }
      }
      curr = curr.parentElement;
    }
    return false;
  }

  // Recursively collect the main document, all same-origin iframe contentDocuments,
  // and open shadow roots so SVG Grabber can penetrate iframe-embedded demos and custom elements.
  function getScanRoots(rootDoc = document) {
    const roots = [];
    const visitedDocs = new Set();
    const visitedRoots = new Set();

    function traverseDoc(doc) {
      if (!doc || visitedDocs.has(doc)) return;
      visitedDocs.add(doc);
      if (!visitedRoots.has(doc)) {
        visitedRoots.add(doc);
        roots.push(doc);
      }

      const iframes = doc.querySelectorAll ? doc.querySelectorAll("iframe, frame") : [];
      iframes.forEach((ifr) => {
        try {
          if (ifr.contentDocument) {
            traverseDoc(ifr.contentDocument);
          }
        } catch (e) {
          // Cross-origin iframe security restrictions
        }
      });

      const allEls = doc.querySelectorAll ? doc.querySelectorAll("*") : [];
      allEls.forEach((el) => {
        if (el.id === HOST_ID || el.id === TOOLBAR_HOST_ID || (el.hasAttribute && el.hasAttribute("data-figma-capture-ignore"))) return;
        if (el.classList && el.classList.contains("wrapper-outer")) return;
        if (el.shadowRoot && !visitedRoots.has(el.shadowRoot)) {
          visitedRoots.add(el.shadowRoot);
          roots.push(el.shadowRoot);
        }
      });
    }

    traverseDoc(rootDoc);
    return roots;
  }

  // Inline <svg> elements across all documents/roots.
  function collectInlineSvgs(roots) {
    roots.forEach((root) => {
      root.querySelectorAll("svg").forEach((svg) => {
        if (isIgnoredElement(svg)) return;
        if (svg.querySelector("symbol")) return;
        const rect = svg.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        const markup = serializeSvg(svg);
        if (markup) registerIcon(markup, { source: "inline", label: elementLabel(svg) }, svg);
      });
    });
  }

  async function collectSpriteIcons(roots) {
    const useElements = [];
    roots.forEach((root) => {
      root.querySelectorAll("svg use").forEach((use) => {
        if (!isIgnoredElement(use)) useElements.push(use);
      });
    });

    for (const use of useElements) {
      const href = use.getAttribute("href") || use.getAttribute("xlink:href") || "";
      if (!href) continue;

      const parentSvg = use.closest("svg");
      if (!parentSvg || isIgnoredElement(parentSvg)) continue;
      const rect = parentSvg.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;

      let target = null;
      let targetId = "";

      if (href.startsWith("#")) {
        targetId = href.slice(1);
        const rootNode = use.getRootNode();
        target = (rootNode.getElementById ? rootNode.getElementById(targetId) : null) || document.getElementById(targetId);
      } else {
        // External SVG reference
        const [url, hash] = href.split("#");
        if (!url || !hash) continue;
        targetId = hash;
        
        // Resolve absolute URL
        const absoluteUrl = new URL(url, location.href).href;

        let externalDoc = spriteCache.get(absoluteUrl);
        if (externalDoc === undefined) {
           try {
             const res = await fetch(absoluteUrl, { credentials: "omit" });
             if (res.ok) {
               const text = await res.text();
               const parser = new DOMParser();
               externalDoc = parser.parseFromString(text, "image/svg+xml");
             } else {
               externalDoc = null;
             }
           } catch (e) {
             externalDoc = null;
           }
           spriteCache.set(absoluteUrl, externalDoc);
        }

        if (externalDoc) {
           target = externalDoc.getElementById(targetId);
        }
      }

      if (!target || isIgnoredElement(target)) continue;
      const viewBox = target.getAttribute("viewBox") || parentSvg.getAttribute("viewBox") || "0 0 24 24";
      
      let inner = "";
      if (target.tagName.toLowerCase() === "symbol") {
        inner = target.innerHTML !== undefined ? target.innerHTML : Array.from(target.childNodes).map(n => new XMLSerializer().serializeToString(n)).join("");
      } else {
        inner = target.outerHTML !== undefined ? target.outerHTML : new XMLSerializer().serializeToString(target);
      }

      const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg>`;
      registerIcon(markup, { source: "sprite", label: elementLabel(parentSvg) || targetId });
    }
  }

  // Only elements in a small, icon-like size range trigger the (expensive)
  // getComputedStyle lookup, so this stays cheap even on huge pages.
  async function collectBackgroundImageIcons(roots, onProgress) {
    const all = [];
    roots.forEach((root) => {
      const elRoot = root.body || root;
      if (elRoot && elRoot.querySelectorAll) {
        all.push(...Array.from(elRoot.querySelectorAll("*")));
      }
    });
    for (let i = 0; i < all.length; i += BG_SCAN_CHUNK_SIZE) {
      const slice = all.slice(i, i + BG_SCAN_CHUNK_SIZE);
      for (const el of slice) {
        if (isIgnoredElement(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 8 || rect.width > 64 || rect.height < 8 || rect.height > 64) continue;
        const bg = getComputedStyle(el).backgroundImage;
        if (!bg || bg === "none") continue;
        const match = /url\((['"]?)(.*?)\1\)/.exec(bg);
        if (!match) continue;
        const url = match[2];
        if (!url.startsWith("data:image/svg+xml") && !isSvgSrc(url)) continue;
        const markup = url.startsWith("data:image/svg+xml") ? decodeDataUriSvg(url) : await fetchSvgText(url);
        const label = elementLabel(el) || filenameFromUrl(url);
        if (markup) registerIcon(markup, { source: "background", label });
        else registerFallback({ source: "background", label, originalUrl: url });
      }
      if (onProgress) onProgress(Math.min(i + BG_SCAN_CHUNK_SIZE, all.length), all.length);
      await idleYield();
    }
  }

  async function collectImgIcons(imgs) {
    for (let i = 0; i < imgs.length; i += IMG_FETCH_CONCURRENCY) {
      const batch = imgs.slice(i, i + IMG_FETCH_CONCURRENCY);
      await Promise.all(batch.map(processImgIcon));
    }
  }

  async function processImgIcon(img) {
    if (isIgnoredElement(img)) return;
    const src = img.currentSrc || img.src;
    const label = (img.alt || "").trim();
    const markup = src.startsWith("data:image/svg+xml") ? decodeDataUriSvg(src) : await fetchSvgText(src);
    if (markup) registerIcon(markup, { source: "img", label });
    else registerFallback({ source: "img", label, originalUrl: src });
  }

  function resetState() {
    iconsByHash.clear();
    fallbacksByUrl.clear();
    spriteCache.clear();
    selectedIds.clear();
    allIcons = [];
    allFallbacks = [];
    anonymousCounter = 0;
    truncatedCount = 0;
  }

  async function runScan(shadowRoot) {
    resetState();
    updateSelectionUI(shadowRoot, []);
    setStatus(shadowRoot, "Scanning page for SVG icons…");
    await new Promise((resolve) => setTimeout(resolve, 0));

    const roots = getScanRoots(document);

    collectInlineSvgs(roots);
    await collectSpriteIcons(roots);
    await collectBackgroundImageIcons(roots, (done, total) => {
      setStatus(shadowRoot, `Scanning page for SVG icons… (${done}/${total})`);
    });

    const imgCandidates = [];
    roots.forEach((root) => {
      root.querySelectorAll("img").forEach((img) => {
        if (!isIgnoredElement(img) && isSvgSrc(img.currentSrc || img.src)) {
          imgCandidates.push(img);
        }
      });
    });
    if (imgCandidates.length) {
      setStatus(shadowRoot, "Resolving image icons…");
      await collectImgIcons(imgCandidates);
    }

    setStatus(shadowRoot, "");
    renderResults(shadowRoot);
  }

  function setStatus(shadowRoot, text) {
    const el = shadowRoot.querySelector("#sgStatus");
    if (el) el.textContent = text;
  }

  function renderResults(shadowRoot) {
    allIcons = Array.from(iconsByHash.values());
    allFallbacks = Array.from(fallbacksByUrl.values());
    applyFiltersAndRender(shadowRoot);
  }

  function cardHtml(item) {
    const label = item.label || "icon";
    const checkbox = item.isFallback
      ? ""
      : `<label class="sg-card-checkbox" title="Select"><input type="checkbox" data-select-id="${escapeAttr(item.id)}" ${selectedIds.has(item.id) ? "checked" : ""} /></label>`;

    const previewInner = item.isFallback
      ? `<img class="sg-fallback-img" src="${escapeAttr(item.originalUrl)}" alt="" />`
      : `<div class="sg-svg-preview" data-lazy-id="${escapeAttr(item.id)}"><div class="sg-preview-placeholder"></div></div>`;

    const actions = item.isFallback
      ? `<a class="sg-action-btn" href="${escapeAttr(item.originalUrl)}" target="_blank" rel="noopener noreferrer" title="Open original">${ICON_LINK}</a>`
      : `<button class="sg-action-btn" data-action="copy" data-icon-id="${escapeAttr(item.id)}" title="Copy SVG code">${ICON_COPY}</button>
         <button class="sg-action-btn" data-action="download" data-icon-id="${escapeAttr(item.id)}" title="Download as .svg">${ICON_DOWNLOAD}</button>`;

    const previewBoxClass = item.isFallback ? "sg-preview-box sg-preview-box-fallback" : "sg-preview-box";
    const previewTitle = item.isFallback ? "" : ` title="Click to copy"`;
    const activeClass = item.id === activeCardId ? " sg-card-active" : "";

    return `
      <div class="sg-card${activeClass}" data-card-id="${escapeAttr(item.id)}">
        <div class="${previewBoxClass}"${previewTitle}>${checkbox}${previewInner}</div>
        <div class="sg-card-label" title="${escapeAttr(label)}">${escapeHtml(label)}</div>
        <div class="sg-card-actions">${actions}</div>
      </div>
    `;
  }

  function getFilteredItems() {
    let items = [...allIcons, ...allFallbacks];
    if (filterText) {
      const q = filterText.toLowerCase();
      items = items.filter((it) => it.label.toLowerCase().includes(q));
    }
    items.sort((a, b) => (sortAsc ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
    return items;
  }

  function applyFiltersAndRender(shadowRoot) {
    const grid = shadowRoot.querySelector("#sgGrid");
    const countEl = shadowRoot.querySelector("#sgCount");
    const items = getFilteredItems();

    grid.innerHTML = items.length ? items.map(cardHtml).join("") : `<div class="sg-empty">No SVG icons found on this page.</div>`;

    const totalFound = allIcons.length + allFallbacks.length + truncatedCount;
    countEl.textContent = truncatedCount > 0
      ? `Showing ${items.length} of ${totalFound}+ icons found`
      : `${items.length} icon${items.length === 1 ? "" : "s"} found`;

    wireCardActions(shadowRoot);
    updateSelectionUI(shadowRoot, items);
    setupLazyLoading(shadowRoot);
  }

  function updateSelectionUI(shadowRoot, items) {
    const selectAllBtn = shadowRoot.querySelector("#sgSelectAll");
    if (selectAllBtn) {
      const selectable = items.filter((it) => !it.isFallback);
      const allSelected = selectable.length > 0 && selectable.every((it) => selectedIds.has(it.id));
      selectAllBtn.textContent = allSelected ? "Deselect All" : "Select All";
      selectAllBtn.disabled = selectable.length === 0;
    }
    updateBatchButton(shadowRoot);
  }

  function flashButton(btn, iconSvg) {
    const original = btn.innerHTML;
    btn.innerHTML = iconSvg;
    btn.classList.add("sg-action-btn-success");
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove("sg-action-btn-success");
    }, 1200);
  }

  let toastHideTimer = null;
  let observer = null;

  function setupLazyLoading(shadowRoot) {
    if (observer) {
      observer.disconnect();
    }
    const previews = shadowRoot.querySelectorAll(".sg-svg-preview[data-lazy-id]");
    if (!previews.length) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const id = container.getAttribute("data-lazy-id");
          const item = iconsByHash.get(id);
          if (item) {
            container.innerHTML = item.markup;
            container.classList.add("loaded");
          }
          observer.unobserve(container);
        }
      });
    }, {
      root: shadowRoot.querySelector("#sgGrid"),
      rootMargin: "100px 0px"
    });

    previews.forEach(p => observer.observe(p));
  }

  function getCopyToastText() {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const key = isMac ? "⌘V" : "Ctrl+V";
    return `
      <div class="sg-toast-inner">
        <svg class="sg-toast-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; flex-shrink:0;">
          <path d="M16 5.07193C17.2067 5.76862 18.2104 6.76837 18.9119 7.9722C19.6134 9.17604 19.9884 10.5422 19.9996 11.9355C20.0109 13.3288 19.658 14.7008 18.9761 15.9158C18.2941 17.1308 17.3066 18.1467 16.1114 18.8628C14.9162 19.5788 13.5547 19.9704 12.1617 19.9986C10.7686 20.0268 9.39238 19.6906 8.16917 19.0235C6.94596 18.3563 5.9182 17.3813 5.18763 16.1949C4.45705 15.0085 4.04901 13.6518 4.00388 12.2592L3.99988 12L4.00388 11.7408C4.04868 10.3592 4.45072 9.01274 5.1708 7.83276C5.89089 6.65277 6.90444 5.6795 8.11264 5.00783C9.32085 4.33617 10.6825 3.98903 12.0648 4.00026C13.4471 4.0115 14.8029 4.38072 16 5.07193ZM14.9656 9.83439C14.8279 9.69664 14.6446 9.6139 14.4502 9.60167C14.2557 9.58945 14.0635 9.64858 13.9096 9.76799L13.8344 9.83439L11.2 12.468L10.1656 11.4344L10.0904 11.368C9.93642 11.2487 9.74425 11.1896 9.54987 11.2019C9.35549 11.2141 9.17227 11.2969 9.03455 11.4346C8.89683 11.5723 8.81408 11.7556 8.80182 11.9499C8.78956 12.1443 8.84862 12.3365 8.96794 12.4904L9.03434 12.5656L10.6344 14.1656L10.7096 14.232C10.8499 14.3409 11.0224 14.4 11.2 14.4C11.3775 14.4 11.5501 14.3409 11.6904 14.232L11.7656 14.1656L14.9656 10.9656L15.032 10.8904C15.1514 10.7365 15.2106 10.5443 15.1983 10.3498C15.1861 10.1554 15.1034 9.97214 14.9656 9.83439Z" fill="#D4FC5D"/>
        </svg>
        <span class="sg-toast-label sg-toast-label-dim">Copied! Press</span>
        <span class="sg-shortcut-key">${key}</span>
        <span class="sg-toast-label">to paste</span>
      </div>
    `;
  }

  function showToast(root, text) {
    const shadowRoot = root instanceof ShadowRoot ? root : root.getRootNode();
    const panel = shadowRoot.querySelector(".sg-panel");
    if (!panel) return;
    let toast = shadowRoot.querySelector("#sgToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "sgToast";
      toast.className = "sg-toast";
      panel.appendChild(toast);
    }
    toast.innerHTML = text;
    toast.classList.add("sg-toast-visible");
    clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => toast.classList.remove("sg-toast-visible"), 2400);
  }

  function sanitizeFilename(name) {
    return String(name).replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "icon";
  }

  async function copySvgToClipboard(svgMarkup) {
    let success = false;

    // Attempt 1: Classic execCommand copy with copy event listener.
    const listener = (e) => {
      try {
        e.clipboardData.setData("text/plain", svgMarkup);
        e.clipboardData.setData("text/html", svgMarkup);
        e.clipboardData.setData("image/svg+xml", svgMarkup);
        e.preventDefault();
        success = true;
      } catch (err) {
        console.error("setData failed inside copy listener:", err);
      }
    };

    document.addEventListener("copy", listener);
    try {
      document.execCommand("copy");
    } catch (err) {
      console.warn("execCommand copy failed:", err);
    } finally {
      document.removeEventListener("copy", listener);
    }

    if (success) return true;

    // Attempt 2: Fall back to modern Async Clipboard API with ClipboardItem
    try {
      const textBlob = new Blob([svgMarkup], { type: "text/plain" });
      const htmlBlob = new Blob([svgMarkup], { type: "text/html" });
      const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml" });

      const data = {
        "text/plain": textBlob,
        "text/html": htmlBlob
      };

      try {
        data["image/svg+xml"] = svgBlob;
      } catch (e) {
        console.warn("image/svg+xml not supported in ClipboardItem:", e);
      }

      await navigator.clipboard.write([new ClipboardItem(data)]);
      return true;
    } catch (err) {
      console.warn("ClipboardItem write failed, falling back to writeText:", err);
      await navigator.clipboard.writeText(svgMarkup);
      return true;
    }
  }

  function cleanSvgForAi(markup, originalSvgEl) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(markup, "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (!svg) return markup;

      // 1. Ensure namespaces & version
      if (!svg.getAttribute("xmlns")) {
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }
      if (!svg.getAttribute("version")) {
        svg.setAttribute("version", "1.1");
      }

      // 2. Determine target width and height, prioritizing the actual rendered layout size on the webpage
      let targetWidth = null;
      let targetHeight = null;

      if (originalSvgEl) {
        const rect = originalSvgEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetWidth = rect.width;
          targetHeight = rect.height;
        }
      }

      if (!targetWidth || !targetHeight) {
        const wAttr = svg.getAttribute("width");
        const hAttr = svg.getAttribute("height");
        if (wAttr && hAttr) {
          const parsedW = parseFloat(wAttr);
          const parsedH = parseFloat(hAttr);
          if (!isNaN(parsedW) && !isNaN(parsedH)) {
            targetWidth = parsedW;
            targetHeight = parsedH;
          }
        }
      }

      if (!targetWidth || !targetHeight) {
        const viewBox = svg.getAttribute("viewBox");
        if (viewBox) {
          const parts = viewBox.trim().split(/\s+/);
          if (parts.length === 4) {
            const vbWidth = parseFloat(parts[2]);
            const vbHeight = parseFloat(parts[3]);
            if (!isNaN(vbWidth) && !isNaN(vbHeight)) {
              targetWidth = vbWidth;
              targetHeight = vbHeight;
            }
          }
        }
      }

      if (!targetWidth || !targetHeight) {
        targetWidth = 24;
        targetHeight = 24;
      }

      svg.setAttribute("width", targetWidth);
      svg.setAttribute("height", targetHeight);

      // Clean up "px" suffix if present
      const wVal = svg.getAttribute("width");
      if (wVal && wVal.endsWith && wVal.endsWith("px")) {
        svg.setAttribute("width", parseFloat(wVal));
      }
      const hVal = svg.getAttribute("height");
      if (hVal && hVal.endsWith && hVal.endsWith("px")) {
        svg.setAttribute("height", parseFloat(hVal));
      }

      // 3. Inline computed styles (only if original element is available and is SVG)
      if (originalSvgEl && originalSvgEl.tagName.toLowerCase() === "svg") {
        const origElements = [originalSvgEl, ...originalSvgEl.querySelectorAll("*")];
        const cloneElements = [svg, ...svg.querySelectorAll("*")];

        for (let i = 0; i < origElements.length; i++) {
          const orig = origElements[i];
          const cln = cloneElements[i];
          if (!orig || !cln) continue;
          if (orig.nodeType !== Node.ELEMENT_NODE) continue;

          if (orig.closest("defs") || orig.closest("symbol") || orig.tagName.toLowerCase() === "defs" || orig.tagName.toLowerCase() === "symbol") {
            continue;
          }

          const computed = window.getComputedStyle(orig);
          
          // fill
          const fillVal = computed.getPropertyValue("fill");
          if (fillVal && fillVal !== "none") {
            cln.setAttribute("fill", fillVal);
          } else if (fillVal === "none") {
            cln.setAttribute("fill", "none");
          }
          
          // stroke
          const strokeVal = computed.getPropertyValue("stroke");
          if (strokeVal && strokeVal !== "none") {
            cln.setAttribute("stroke", strokeVal);
            
            const strokeWidth = computed.getPropertyValue("stroke-width");
            if (strokeWidth && strokeWidth !== "0px") cln.setAttribute("stroke-width", strokeWidth);
            
            const strokeLinecap = computed.getPropertyValue("stroke-linecap");
            if (strokeLinecap && strokeLinecap !== "butt") cln.setAttribute("stroke-linecap", strokeLinecap);
            
            const strokeLinejoin = computed.getPropertyValue("stroke-linejoin");
            if (strokeLinejoin && strokeLinejoin !== "miter") cln.setAttribute("stroke-linejoin", strokeLinejoin);

            const strokeDasharray = computed.getPropertyValue("stroke-dasharray");
            if (strokeDasharray && strokeDasharray !== "none") cln.setAttribute("stroke-dasharray", strokeDasharray);

            const strokeOpacity = computed.getPropertyValue("stroke-opacity");
            if (strokeOpacity && strokeOpacity !== "1") cln.setAttribute("stroke-opacity", strokeOpacity);
          }
          
          // opacity
          const opacityVal = computed.getPropertyValue("opacity");
          if (opacityVal && opacityVal !== "1") {
            cln.setAttribute("opacity", opacityVal);
          }
          
          const fillOpacityVal = computed.getPropertyValue("fill-opacity");
          if (fillOpacityVal && fillOpacityVal !== "1") {
            cln.setAttribute("fill-opacity", fillOpacityVal);
          }

          // transform
          const transformVal = computed.getPropertyValue("transform");
          if (transformVal && transformVal !== "none") {
            cln.setAttribute("transform", transformVal);
          }
        }
      }

      let cleanMarkup = svg.outerHTML;

      // 4. Resolve wide-gamut display-p3 color syntax using regex
      cleanMarkup = cleanMarkup.replace(/color\s*\(\s*display-p3\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/g, (match, r, g, b, a) => {
        const red = Math.round(parseFloat(r) * 255);
        const green = Math.round(parseFloat(g) * 255);
        const blue = Math.round(parseFloat(b) * 255);
        if (a !== undefined) {
          return `rgba(${red}, ${green}, ${blue}, ${parseFloat(a)})`;
        }
        return `rgb(${red}, ${green}, ${blue})`;
      });

      // 5. Remove any overriding stroke:color(display-p3 ...) style rule inside style attributes to prevent Illustrator parser failure
      cleanMarkup = cleanMarkup.replace(/stroke\s*:\s*color\([^)]+\)\s*;?/g, "");
      cleanMarkup = cleanMarkup.replace(/fill\s*:\s*color\([^)]+\)\s*;?/g, "");

      return cleanMarkup;
    } catch (e) {
      console.error("Error cleaning SVG for Ai:", e);
      return markup;
    }
  }

  async function performCopy(item, btn = null, rootNode = null) {
    try {
      const cleaned = cleanSvgForAi(item.markup, item.originalEl);
      await copySvgToClipboard(cleaned);
      if (btn) {
        flashButton(btn, ICON_CHECK);
      }
      showToast(rootNode || btn.getRootNode(), getCopyToastText());
    } catch (e) {
      if (btn) {
        flashButton(btn, ICON_ERROR);
      }
    }
  }

  async function handleCopy(btn) {
    const item = iconsByHash.get(btn.getAttribute("data-icon-id"));
    if (!item) return;
    await performCopy(item, btn);
  }



  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleDownload(btn) {
    const item = iconsByHash.get(btn.getAttribute("data-icon-id"));
    if (!item) return;
    triggerDownload(new Blob([item.markup], { type: "image/svg+xml" }), `${sanitizeFilename(item.label)}.svg`);
    flashButton(btn, ICON_CHECK);
  }

  function updateBatchButton(shadowRoot) {
    const btn = shadowRoot.querySelector("#sgBatchDownload");
    if (!btn) return;
    btn.textContent = `Download ZIP (${selectedIds.size})`;
    btn.disabled = selectedIds.size === 0;
  }

  function handleBatchDownload(shadowRoot) {
    const items = Array.from(selectedIds).map((id) => iconsByHash.get(id)).filter(Boolean);
    if (!items.length) return;
    const usedNames = new Set();
    const entries = items.map((item) => {
      const base = sanitizeFilename(item.label);
      let name = `${base}.svg`;
      let n = 1;
      while (usedNames.has(name)) name = `${base}-${++n}.svg`;
      usedNames.add(name);
      return { name, data: new TextEncoder().encode(item.markup) };
    });
    triggerDownload(buildZipBlob(entries), "svg-icons.zip");
  }

  function wireCardActions(shadowRoot) {
    shadowRoot.querySelectorAll('.sg-action-btn[data-action="copy"]').forEach((btn) => btn.addEventListener("click", () => handleCopy(btn)));
    shadowRoot.querySelectorAll('.sg-action-btn[data-action="download"]').forEach((btn) => btn.addEventListener("click", () => handleDownload(btn)));

    shadowRoot.querySelectorAll("[data-select-id]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.getAttribute("data-select-id");
        if (cb.checked) selectedIds.add(id);
        else selectedIds.delete(id);
        updateSelectionUI(shadowRoot, getFilteredItems());
      });
    });

    shadowRoot.querySelectorAll(".sg-preview-box:not(.sg-preview-box-fallback)").forEach((box) => {
      box.addEventListener("click", (e) => {
        if (e.target.closest(".sg-card-checkbox")) return;
        const card = box.closest(".sg-card");
        if (!card) return;
        const id = card.getAttribute("data-card-id");
        const item = iconsByHash.get(id);
        if (item) {
          performCopy(item, null, shadowRoot);
        }
      });
    });

    shadowRoot.querySelectorAll(".sg-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-card-id");
        if (activeCardId === id) return;

        // Remove active class from the previously active card immediately (no lag)
        shadowRoot.querySelectorAll(".sg-card.sg-card-active").forEach((el) => {
          el.classList.remove("sg-card-active");
        });

        // Add active class to the clicked card
        card.classList.add("sg-card-active");
        activeCardId = id;
      });
    });
  }

  // Minimal uncompressed (STORE method) ZIP writer - no external deps.
  function crc32(bytes) {
    let crc = ~0;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return ~crc >>> 0;
  }

  function buildZipBlob(entries) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

    entries.forEach((entry) => {
      const nameBytes = new TextEncoder().encode(entry.name);
      const data = entry.data;
      const crc = crc32(data);

      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0, true);
      local.setUint16(8, 0, true);
      local.setUint16(10, dosTime, true);
      local.setUint16(12, dosDate, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, nameBytes.length, true);
      local.setUint16(28, 0, true);
      localParts.push(new Uint8Array(local.buffer), nameBytes, data);

      const central = new DataView(new ArrayBuffer(46));
      central.setUint32(0, 0x02014b50, true);
      central.setUint16(4, 20, true);
      central.setUint16(6, 20, true);
      central.setUint16(8, 0, true);
      central.setUint16(10, 0, true);
      central.setUint16(12, dosTime, true);
      central.setUint16(14, dosDate, true);
      central.setUint32(16, crc, true);
      central.setUint32(20, data.length, true);
      central.setUint32(24, data.length, true);
      central.setUint16(28, nameBytes.length, true);
      central.setUint16(30, 0, true);
      central.setUint16(32, 0, true);
      central.setUint16(34, 0, true);
      central.setUint16(36, 0, true);
      central.setUint32(38, 0, true);
      central.setUint32(42, offset, true);
      centralParts.push(new Uint8Array(central.buffer), nameBytes);

      offset += local.byteLength + nameBytes.length + data.length;
    });

    const centralStart = offset;
    const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);

    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(4, 0, true);
    end.setUint16(6, 0, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, centralStart, true);
    end.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, new Uint8Array(end.buffer)], { type: "application/zip" });
  }

  function getShellHtml() {
    return `
      <div class="sg-backdrop">
        <div class="sg-panel" role="dialog" aria-label="Grab SVG icons">
          <div class="sg-header">
            <div class="sg-title"><span class="sg-title-icon">${ICON_TITLE}</span><span>Grab SVG</span></div>
            <button class="sg-close-btn" id="sgClose" type="button" title="Close">${ICON_CLOSE}</button>
          </div>
          <div class="sg-controls">
            <input class="sg-search" id="sgSearch" type="text" placeholder="Filter icons…" title="Filter by name" />
            <button class="sg-control-btn" id="sgSort" type="button" title="Sort alphabetically">A–Z</button>
            <div class="sg-bg-toggle" id="sgBgToggle">
              <button data-bg="light" class="active" type="button" title="Light preview">${ICON_SUN}</button>
              <button data-bg="dark" type="button" title="Dark preview">${ICON_MOON}</button>
            </div>
            <button class="sg-control-btn" id="sgSelectAll" type="button" title="Select or deselect all icons" disabled>Select All</button>
            <button class="sg-control-btn" id="sgBatchDownload" type="button" title="Download selected icons as a .zip" disabled>Download ZIP (0)</button>
          </div>
          <div class="sg-status" id="sgStatus"></div>
          <div class="sg-grid" id="sgGrid"></div>
          <div class="sg-footer">
            <span id="sgCount"></span>
            <span class="sg-compat-info">Compatible with Figma / Sketch / XD / Illustrator</span>
          </div>
        </div>
      </div>
    `;
  }

  function getStyleContent() {
    return `
      :host {
        all: initial;
        --token-radius-sm: 4px;
        --token-radius-md: 6px;
        --token-radius-lg: 10px;
        --token-radius-xl: 16px;
        --token-radius-full: 50%;
        --token-transition-normal: 0.2s ease;
      }
      * { box-sizing: border-box; }

      .sg-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
        animation: sg-fade-in 0.25s ease both;
      }
      .sg-backdrop.sg-closing {
        animation: sg-fade-out 0.2s ease both;
      }
      @keyframes sg-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes sg-fade-out {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      /* Token definitions for Light theme (default) and Dark theme */
      .sg-panel {
        --sg-accent: #7ee100;
        --token-bg-panel: #ededed;
        --token-border-panel: rgba(0, 0, 0, 0.08);
        --token-shadow-panel: 0px 8px 32px 0px rgba(0, 0, 0, 0.25), 0px 0px 1px 0px rgba(255, 255, 255, 0.4) inset;
        --token-text-primary: #1a1a1a;
        --token-text-secondary: rgba(0, 0, 0, 0.65);
        --token-text-muted: rgba(0, 0, 0, 0.55);
        --token-text-faint: rgba(0, 0, 0, 0.4);
        --token-border-default: rgba(0, 0, 0, 0.08);
        --token-border-input: rgba(0, 0, 0, 0.12);
        --token-bg-input: #ffffff;
        --token-bg-btn: rgba(0, 0, 0, 0.04);
        --token-bg-btn-hover: rgba(0, 0, 0, 0.08);
        --token-bg-toggle: rgba(0, 0, 0, 0.02);
        --token-bg-toggle-active: rgba(0, 0, 0, 0.08);
        --token-text-toggle-active: rgba(0, 0, 0, 0.9);
        --token-bg-card: #ffffff;
        --token-bg-preview: rgba(237, 237, 237, 0.5);
        --token-bg-placeholder: rgba(0, 0, 0, 0.05);
        --token-scrollbar-thumb: rgba(0, 0, 0, 0.2);
        --token-scrollbar-thumb-hover: rgba(0, 0, 0, 0.35);

        position: relative;
        width: min(1040px, 92vw);
        height: min(720px, 88vh);
        background: var(--token-bg-panel);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: var(--token-radius-xl);
        border: 1px solid var(--token-border-panel);
        box-shadow: var(--token-shadow-panel);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: var(--token-text-primary);
        transition: background-color var(--token-transition-normal), color var(--token-transition-normal);
        animation: sg-panel-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .sg-panel.sg-closing {
        animation: sg-panel-out 0.2s cubic-bezier(0.4, 0, 1, 1) both;
      }
      @keyframes sg-panel-in {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes sg-panel-out {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to   { opacity: 0; transform: translateY(8px) scale(0.97); }
      }
      .sg-panel.sg-theme-dark {
        --sg-accent: #D4FC5D;
        --token-bg-panel: rgba(30, 30, 30, 0.96);
        --token-border-panel: rgba(255, 255, 255, 0.08);
        --token-shadow-panel: 0px 8px 32px 0px rgba(0, 0, 0, 0.45), 0px 0px 1px 0px rgba(255, 255, 255, 0.15) inset;
        --token-text-primary: rgba(255, 255, 255, 0.9);
        --token-text-secondary: rgba(255, 255, 255, 0.8);
        --token-text-muted: rgba(255, 255, 255, 0.6);
        --token-text-faint: rgba(255, 255, 255, 0.4);
        --token-border-default: rgba(255, 255, 255, 0.08);
        --token-border-input: rgba(255, 255, 255, 0.12);
        --token-bg-input: rgba(255, 255, 255, 0.08);
        --token-bg-btn: rgba(255, 255, 255, 0.08);
        --token-bg-btn-hover: rgba(255, 255, 255, 0.15);
        --token-bg-toggle: rgba(255, 255, 255, 0.02);
        --token-bg-toggle-active: rgba(255, 255, 255, 0.15);
        --token-text-toggle-active: #ffffff;
        --token-bg-card: rgba(255, 255, 255, 0.05);
        --token-bg-preview: #1c1c1c;
        --token-bg-placeholder: rgba(255, 255, 255, 0.05);
        --token-scrollbar-thumb: rgba(255, 255, 255, 0.25);
        --token-scrollbar-thumb-hover: rgba(255, 255, 255, 0.4);
      }

      .sg-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid var(--token-border-default);
        flex-shrink: 0;
      }

      .sg-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
      .sg-title-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: var(--token-radius-md);
        background: var(--sg-accent);
        flex-shrink: 0;
      }
      .sg-title-icon svg { width: 16px; height: 16px; display: block; color: #000000; }

      .sg-close-btn {
        border: none;
        background: var(--token-bg-btn);
        color: var(--token-text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: var(--token-radius-full);
        cursor: pointer;
        transition: background-color var(--token-transition-normal), color var(--token-transition-normal), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
      }
      .sg-close-btn:hover { background: var(--token-bg-btn-hover); transform: rotate(90deg); }

      .sg-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--token-border-default);
        flex-wrap: wrap;
        flex-shrink: 0;
      }

      .sg-search {
        flex: 1 1 160px;
        min-width: 120px;
        background: var(--token-bg-input);
        border: 1px solid var(--token-border-input);
        border-radius: var(--token-radius-md);
        color: var(--token-text-primary);
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        padding: 6px 10px;
        outline: none;
      }
      .sg-search::placeholder { color: var(--token-text-faint); }
      .sg-search:focus { border-color: var(--sg-accent); box-shadow: 0 0 0 1px var(--sg-accent); }

      .sg-control-btn {
        background: var(--token-bg-btn);
        border: 1px solid var(--token-border-input);
        border-radius: var(--token-radius-md);
        color: var(--token-text-primary);
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        padding: 6px 10px;
        cursor: pointer;
        white-space: nowrap;
      }
      .sg-control-btn:hover { background: var(--token-bg-btn-hover); }
      .sg-control-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      .sg-bg-toggle { display: flex; border: 1px solid var(--token-border-input); border-radius: var(--token-radius-md); overflow: hidden; background: var(--token-bg-toggle); }
      .sg-bg-toggle button {
        background: transparent;
        border: none;
        color: var(--token-text-faint);
        padding: 6px 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all var(--token-transition-normal);
      }
      .sg-bg-toggle button svg { width: 14px; height: 14px; display: block; }
      .sg-bg-toggle button.active { background: var(--token-bg-toggle-active); color: var(--token-text-toggle-active); }

      .sg-status { padding: 8px 16px 0; font-size: 12px; color: var(--token-text-muted); min-height: 18px; flex-shrink: 0; }

      .sg-grid {
        flex: 1;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 16px;
        align-content: start;
        scrollbar-width: thin;
        scrollbar-color: var(--token-scrollbar-thumb) transparent;
      }
      .sg-grid::-webkit-scrollbar { width: 8px; }
      .sg-grid::-webkit-scrollbar-track { background: transparent; }
      .sg-grid::-webkit-scrollbar-thumb { background: var(--token-scrollbar-thumb); border-radius: var(--token-radius-sm); }
      .sg-grid::-webkit-scrollbar-thumb:hover { background: var(--token-scrollbar-thumb-hover); }

      .sg-empty { grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--token-text-muted); font-size: 13px; }

      .sg-card {
        background: var(--token-bg-card);
        border: 1px solid var(--token-border-default);
        color: var(--token-text-primary);
        border-radius: var(--token-radius-lg);
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .sg-card:hover, .sg-card:active, .sg-card.sg-card-active { border-color: var(--sg-accent); box-shadow: 0 0 0 2px var(--sg-accent) inset; }

      .sg-preview-box {
        position: relative;
        width: 100%;
        height: 80px;
        border-radius: var(--token-radius-md);
        background: var(--token-bg-preview);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: background-color var(--token-transition-normal);
      }
      .sg-preview-box:not(.sg-preview-box-fallback) { cursor: pointer; }

      .sg-svg-preview { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
      .sg-svg-preview svg { max-width: 100%; max-height: 100%; width: auto; height: auto; opacity: 0; transition: opacity var(--token-transition-normal); }
      .sg-svg-preview.loaded svg { opacity: 1; }
      .sg-preview-placeholder {
        width: 32px;
        height: 32px;
        background: var(--token-bg-placeholder);
        border-radius: var(--token-radius-sm);
        animation: sg-pulse 1.5s infinite ease-in-out;
      }
      @keyframes sg-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 0.3; }
      }

      .sg-fallback-img { max-width: 36px; max-height: 36px; }

      .sg-card-checkbox {
        position: absolute;
        top: 4px;
        left: 4px;
        z-index: 1;
        display: flex;
        cursor: pointer;
      }
      .sg-card-checkbox input { width: 15px; height: 15px; margin: 0; cursor: pointer; }

      .sg-card-label {
        width: 100%;
        font-size: 11px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 0.85;
      }

      .sg-card-actions { display: flex; align-items: center; justify-content: center; gap: 6px; }

      .sg-action-btn {
        border: none;
        background: transparent;
        color: var(--token-text-secondary);
        width: 30px;
        height: 30px;
        border-radius: var(--token-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        transition: background-color var(--token-transition-normal), color var(--token-transition-normal);
      }
      .sg-action-btn:hover { background: var(--sg-accent); color: #000000; }
      .sg-action-btn-success { background: var(--sg-accent) !important; color: #000000 !important; }
      .sg-action-btn svg { width: 16px; height: 16px; display: block; }

      .sg-footer {
        padding: 8px 16px;
        border-top: 1px solid var(--token-border-default);
        font-size: 11px;
        color: var(--token-text-muted);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .sg-compat-info {
        color: var(--token-text-faint);
        font-weight: 500;
      }

      .sg-toast {
        position: absolute;
        left: 50%;
        bottom: 20px;
        transform: translate(-50%, 12px);
        background: rgba(20, 20, 20, 0.95);
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 500;
        padding: 6px 12px;
        border-radius: 20px;
        box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.3);
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--token-transition-normal), transform var(--token-transition-normal);
        z-index: 1000;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .sg-toast-visible { opacity: 1; transform: translate(-50%, 0); }
      .sg-toast-inner {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .sg-toast-label {
        color: rgba(255, 255, 255, 0.9);
      }
      .sg-toast-label-dim {
        color: rgba(255, 255, 255, 0.6);
      }
      .sg-shortcut-key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 5px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--token-radius-sm);
        font-size: 11px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        background: rgba(255, 255, 255, 0.06);
        line-height: 12px;
      }
    `;
  }

  function wireShell(shadowRoot, host) {
    const panel = shadowRoot.querySelector(".sg-panel");
    const backdrop = shadowRoot.querySelector(".sg-backdrop");
    const closeBtn = shadowRoot.querySelector("#sgClose");
    const searchInput = shadowRoot.querySelector("#sgSearch");
    const sortBtn = shadowRoot.querySelector("#sgSort");
    const bgButtons = shadowRoot.querySelectorAll("#sgBgToggle button");
    const selectAllBtn = shadowRoot.querySelector("#sgSelectAll");
    const batchBtn = shadowRoot.querySelector("#sgBatchDownload");

    function onKeyDown(e) {
      if (e.key === "Escape") cleanupAndClose();
    }
    function cleanupAndClose() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      document.removeEventListener("keydown", onKeyDown, true);
      backdrop.classList.add("sg-closing");
      panel.classList.add("sg-closing");
      setTimeout(() => host.remove(), 200);
    }

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) cleanupAndClose();
    });
    closeBtn.addEventListener("click", cleanupAndClose);
    document.addEventListener("keydown", onKeyDown, true);

    searchInput.addEventListener("input", () => {
      filterText = searchInput.value.trim();
      applyFiltersAndRender(shadowRoot);
    });

    sortBtn.addEventListener("click", () => {
      sortAsc = !sortAsc;
      sortBtn.textContent = sortAsc ? "A–Z" : "Z–A";
      applyFiltersAndRender(shadowRoot);
    });

    bgButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        bgButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        panel.classList.toggle("sg-theme-dark", btn.dataset.bg === "dark");
      });
    });

    selectAllBtn.addEventListener("click", () => {
      const selectable = getFilteredItems().filter((it) => !it.isFallback);
      const allSelected = selectable.length > 0 && selectable.every((it) => selectedIds.has(it.id));
      selectable.forEach((it) => (allSelected ? selectedIds.delete(it.id) : selectedIds.add(it.id)));
      applyFiltersAndRender(shadowRoot);
    });

    batchBtn.addEventListener("click", () => handleBatchDownload(shadowRoot));
  }

  function open() {
    const host = document.createElement("div");
    host.id = HOST_ID;
    host.setAttribute("data-figma-capture-ignore", "1");
    host.setAttribute("data-h2d-ignore", "true");
    const shadowRoot = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = getStyleContent();
    shadowRoot.appendChild(style);

    const temp = document.createElement("div");
    temp.innerHTML = getShellHtml();
    shadowRoot.appendChild(temp.firstElementChild);

    (document.body || document.documentElement).appendChild(host);

    wireShell(shadowRoot, host);
    runScan(shadowRoot);
  }

  function main() {
    ensureFontsLoaded();
    const existingHost = document.getElementById(HOST_ID);
    if (existingHost && existingHost.shadowRoot) {
      runScan(existingHost.shadowRoot);
      return;
    }
    open();
  }

  main();
})();
