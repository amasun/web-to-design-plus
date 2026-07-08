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
  const selectedIds = new Set();
  let allIcons = [];
  let allFallbacks = [];
  let anonymousCounter = 0;
  let truncatedCount = 0;
  let filterText = "";
  let sortAsc = true;
  let previewFillColor = null;
  let previewStrokeColor = null;

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

  function elementLabel(el) {
    const aria = el.getAttribute && (el.getAttribute("aria-label") || el.getAttribute("title"));
    if (aria && aria.trim()) return aria.trim();
    const titleEl = el.querySelector && el.querySelector("title");
    if (titleEl && titleEl.textContent.trim()) return titleEl.textContent.trim();
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

  function registerIcon(markup, meta) {
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
    iconsByHash.set(hash, { id: hash, markup, count: 1, source: meta.source, label });
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

  // Inline <svg> elements. Sprite-sheet containers (holding <symbol> defs
  // but never rendered themselves) are skipped here and handled by
  // collectSpriteIcons instead.
  function collectInlineSvgs() {
    document.querySelectorAll("svg").forEach((svg) => {
      if (svg.querySelector("symbol")) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const markup = serializeSvg(svg);
      if (markup) registerIcon(markup, { source: "inline", label: elementLabel(svg) });
    });
  }

  function collectSpriteIcons() {
    document.querySelectorAll("svg use").forEach((use) => {
      const href = use.getAttribute("href") || use.getAttribute("xlink:href") || "";
      if (!href.startsWith("#")) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      const parentSvg = use.closest("svg");
      if (!parentSvg) return;
      const rect = parentSvg.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const viewBox = target.getAttribute("viewBox") || parentSvg.getAttribute("viewBox") || "0 0 24 24";
      const inner = target.tagName.toLowerCase() === "symbol" ? target.innerHTML : target.outerHTML;
      const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg>`;
      registerIcon(markup, { source: "sprite", label: elementLabel(parentSvg) || href.slice(1) });
    });
  }

  // Only elements in a small, icon-like size range trigger the (expensive)
  // getComputedStyle lookup, so this stays cheap even on huge pages.
  async function collectBackgroundImageIcons(onProgress) {
    const all = document.body ? Array.from(document.body.querySelectorAll("*")) : [];
    for (let i = 0; i < all.length; i += BG_SCAN_CHUNK_SIZE) {
      const slice = all.slice(i, i + BG_SCAN_CHUNK_SIZE);
      for (const el of slice) {
        if (el.id === HOST_ID || el.id === TOOLBAR_HOST_ID) continue;
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
    const src = img.currentSrc || img.src;
    const label = (img.alt || "").trim();
    const markup = src.startsWith("data:image/svg+xml") ? decodeDataUriSvg(src) : await fetchSvgText(src);
    if (markup) registerIcon(markup, { source: "img", label });
    else registerFallback({ source: "img", label, originalUrl: src });
  }

  function resetState() {
    iconsByHash.clear();
    fallbacksByUrl.clear();
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

    collectInlineSvgs();
    collectSpriteIcons();
    await collectBackgroundImageIcons((done, total) => {
      setStatus(shadowRoot, `Scanning page for SVG icons… (${done}/${total})`);
    });

    const imgCandidates = Array.from(document.querySelectorAll("img")).filter((img) => isSvgSrc(img.currentSrc || img.src));
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

  // DOM-based recolor (not regex) so it works regardless of quote style,
  // attribute casing, or currentColor usage. Parsed via a detached <div>'s
  // innerHTML rather than DOMParser("image/svg+xml") - the latter is strict
  // XML and throws a parsererror on markup that's extremely common in the
  // wild (e.g. unnamespaced xlink:href from a sprite <use>), which silently
  // fell back to the un-recolored original. The HTML parser's "foreign
  // content" handling for embedded <svg> tolerates all of that. Elements
  // with an explicit fill/stroke of "none" are left untouched so
  // outline-only icons don't gain an unwanted fill/stroke. Setting fill on
  // the root is a safe fallback for icons that never declare their own
  // fill (SVG presentation attributes inherit down the tree), but only
  // when the root isn't itself explicitly fill="none" (stroke-only sets).
  function recolorMarkup(markup, fillColor, strokeColor) {
    if (!fillColor && !strokeColor) return markup;
    try {
      const container = document.createElement("div");
      container.innerHTML = markup;
      const svg = container.querySelector("svg");
      if (!svg) return markup;
      svg.querySelectorAll("*").forEach((el) => {
        if (fillColor) {
          const fill = el.getAttribute("fill");
          if (fill && fill.toLowerCase() !== "none") el.setAttribute("fill", fillColor);
        }
        if (strokeColor) {
          const stroke = el.getAttribute("stroke");
          if (stroke && stroke.toLowerCase() !== "none") el.setAttribute("stroke", strokeColor);
        }
      });
      if (fillColor) {
        const rootFill = svg.getAttribute("fill");
        if (!rootFill || rootFill.toLowerCase() !== "none") svg.setAttribute("fill", fillColor);
      }
      return svg.outerHTML;
    } catch (e) {
      return markup;
    }
  }

  function previewMarkup(item) {
    return recolorMarkup(item.markup, previewFillColor, previewStrokeColor);
  }

  function cardHtml(item) {
    const label = item.label || "icon";
    const checkbox = item.isFallback
      ? ""
      : `<label class="sg-card-checkbox" title="Select"><input type="checkbox" data-select-id="${escapeAttr(item.id)}" ${selectedIds.has(item.id) ? "checked" : ""} /></label>`;

    const previewInner = item.isFallback
      ? `<img class="sg-fallback-img" src="${escapeAttr(item.originalUrl)}" alt="" />`
      : `<div class="sg-svg-preview">${previewMarkup(item)}</div>`;

    const actions = item.isFallback
      ? `<a class="sg-action-btn" href="${escapeAttr(item.originalUrl)}" target="_blank" rel="noopener noreferrer" title="Open original">${ICON_LINK}</a>`
      : `<button class="sg-action-btn" data-action="copy" data-icon-id="${escapeAttr(item.id)}" title="Copy SVG code">${ICON_COPY}</button>
         <button class="sg-action-btn" data-action="download" data-icon-id="${escapeAttr(item.id)}" title="Download as .svg">${ICON_DOWNLOAD}</button>`;

    const previewBoxClass = item.isFallback ? "sg-preview-box sg-preview-box-fallback" : "sg-preview-box";
    const previewTitle = item.isFallback ? "" : ` title="Click to copy"`;

    return `
      <div class="sg-card">
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

  function sanitizeFilename(name) {
    return String(name).replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "icon";
  }

  async function handleCopy(btn) {
    const item = iconsByHash.get(btn.getAttribute("data-icon-id"));
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.markup);
      flashButton(btn, ICON_CHECK);
    } catch (e) {
      flashButton(btn, ICON_ERROR);
    }
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
        const copyBtn = box.parentElement.querySelector('.sg-action-btn[data-action="copy"]');
        if (copyBtn) handleCopy(copyBtn);
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
            <div class="sg-title">${ICON_TITLE}<span>Grab SVG</span></div>
            <button class="sg-close-btn" id="sgClose" type="button" title="Close">${ICON_CLOSE}</button>
          </div>
          <div class="sg-controls">
            <input class="sg-search" id="sgSearch" type="text" placeholder="Filter icons…" title="Filter by name" />
            <button class="sg-control-btn" id="sgSort" type="button" title="Sort alphabetically">A–Z</button>
            <div class="sg-bg-toggle" id="sgBgToggle">
              <button data-bg="light" class="active" type="button" title="Light preview">${ICON_SUN}</button>
              <button data-bg="dark" type="button" title="Dark preview">${ICON_MOON}</button>
            </div>
            <label class="sg-color-control" title="Fill color override">
              <input id="sgFillColor" type="color" value="#000000" title="Fill color override" />
              <span>Fill</span>
            </label>
            <label class="sg-color-control" title="Stroke color override">
              <input id="sgStrokeColor" type="color" value="#000000" title="Stroke color override" />
              <span>Stroke</span>
            </label>
            <button class="sg-control-btn" id="sgColorReset" type="button" title="Reset color override">Reset</button>
            <button class="sg-control-btn" id="sgSelectAll" type="button" title="Select or deselect all icons" disabled>Select All</button>
            <button class="sg-control-btn" id="sgBatchDownload" type="button" title="Download selected icons as a .zip" disabled>Download ZIP (0)</button>
          </div>
          <div class="sg-status" id="sgStatus"></div>
          <div class="sg-grid" id="sgGrid"></div>
          <div class="sg-footer"><span id="sgCount"></span></div>
        </div>
      </div>
    `;
  }

  function getStyleContent() {
    return `
      :host { all: initial; }
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
      }

      /* Light theme is the default (matches the "Light" toggle being active
         on open); .sg-theme-dark below restores the original all-dark look
         for the whole panel, not just the card previews. */
      .sg-panel {
        --sg-accent: #7ee100;
        width: min(1040px, 92vw);
        height: min(720px, 88vh);
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 16px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.25), 0px 0px 1px 0px rgba(255, 255, 255, 0.4) inset;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #1a1a1a;
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      .sg-panel.sg-theme-dark {
        --sg-accent: #D4FC5D;
        background: rgba(30, 30, 30, 0.96);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.45), 0px 0px 1px 0px rgba(255, 255, 255, 0.15) inset;
        color: rgba(255, 255, 255, 0.9);
      }

      .sg-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        flex-shrink: 0;
      }
      .sg-theme-dark .sg-header { border-bottom-color: rgba(255, 255, 255, 0.08); }

      .sg-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
      .sg-title svg { width: 24px; height: 24px; display: block; flex-shrink: 0; color: var(--sg-accent); }

      .sg-close-btn {
        border: none;
        background: rgba(0, 0, 0, 0.06);
        color: rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.2s ease, color 0.2s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
      }
      .sg-close-btn:hover { background: rgba(0, 0, 0, 0.12); transform: rotate(90deg); }
      .sg-theme-dark .sg-close-btn { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9); }
      .sg-theme-dark .sg-close-btn:hover { background: rgba(255, 255, 255, 0.2); }

      .sg-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        flex-wrap: wrap;
        flex-shrink: 0;
      }
      .sg-theme-dark .sg-controls { border-bottom-color: rgba(255, 255, 255, 0.08); }

      .sg-search {
        flex: 1 1 160px;
        min-width: 120px;
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 6px;
        color: #1a1a1a;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        padding: 6px 10px;
        outline: none;
      }
      .sg-search::placeholder { color: rgba(0, 0, 0, 0.4); }
      .sg-search:focus { border-color: var(--sg-accent); }
      .sg-theme-dark .sg-search { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.12); color: rgba(255, 255, 255, 0.9); }
      .sg-theme-dark .sg-search::placeholder { color: rgba(255, 255, 255, 0.4); }

      .sg-control-btn {
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 6px;
        color: #1a1a1a;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        padding: 6px 10px;
        cursor: pointer;
        white-space: nowrap;
      }
      .sg-control-btn:hover { background: rgba(0, 0, 0, 0.08); }
      .sg-control-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .sg-theme-dark .sg-control-btn { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.12); color: rgba(255, 255, 255, 0.9); }
      .sg-theme-dark .sg-control-btn:hover { background: rgba(255, 255, 255, 0.15); }

      .sg-bg-toggle { display: flex; border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 6px; overflow: hidden; }
      .sg-bg-toggle button {
        background: transparent;
        border: none;
        color: rgba(0, 0, 0, 0.55);
        padding: 6px 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      .sg-bg-toggle button svg { width: 14px; height: 14px; display: block; }
      .sg-bg-toggle button.active { background: var(--sg-accent); color: #000000; }
      .sg-theme-dark .sg-bg-toggle { border-color: rgba(255, 255, 255, 0.12); }
      .sg-theme-dark .sg-bg-toggle button { color: rgba(255, 255, 255, 0.7); }

      .sg-color-control { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; }
      .sg-color-control input[type="color"] { width: 22px; height: 22px; border: none; border-radius: 4px; padding: 0; cursor: pointer; background: transparent; }

      .sg-status { padding: 8px 16px 0; font-size: 12px; color: rgba(0, 0, 0, 0.55); min-height: 18px; flex-shrink: 0; }
      .sg-theme-dark .sg-status { color: rgba(255, 255, 255, 0.6); }

      .sg-grid {
        flex: 1;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 16px;
        align-content: start;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
      }
      .sg-grid::-webkit-scrollbar { width: 8px; }
      .sg-grid::-webkit-scrollbar-track { background: transparent; }
      .sg-grid::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
      .sg-grid::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.35); }
      .sg-theme-dark .sg-grid { scrollbar-color: rgba(255, 255, 255, 0.25) transparent; }
      .sg-theme-dark .sg-grid::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.25); }
      .sg-theme-dark .sg-grid::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }

      .sg-empty { grid-column: 1 / -1; text-align: center; padding: 40px 0; color: rgba(0, 0, 0, 0.45); font-size: 13px; }
      .sg-theme-dark .sg-empty { color: rgba(255, 255, 255, 0.5); }

      .sg-card {
        background: #f5f5f5;
        border: 1px solid rgba(0, 0, 0, 0.08);
        color: #1a1a1a;
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .sg-theme-dark .sg-card { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.9); }

      .sg-preview-box {
        position: relative;
        width: 100%;
        height: 80px;
        border-radius: 6px;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: background-color 0.2s ease;
      }
      .sg-theme-dark .sg-preview-box { background: #1c1c1c; }
      .sg-preview-box:not(.sg-preview-box-fallback) { cursor: pointer; }
      .sg-preview-box:not(.sg-preview-box-fallback):hover { box-shadow: 0 0 0 2px var(--sg-accent) inset; }

      .sg-svg-preview { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
      .sg-svg-preview svg { max-width: 100%; max-height: 100%; width: auto; height: auto; }

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
        background: rgba(0, 0, 0, 0.06);
        color: rgba(0, 0, 0, 0.65);
        width: 30px;
        height: 30px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      .sg-theme-dark .sg-action-btn { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.8); }
      .sg-action-btn:hover { background: var(--sg-accent); color: #000000; }
      .sg-action-btn-success { background: var(--sg-accent) !important; color: #000000 !important; }
      .sg-action-btn svg { width: 16px; height: 16px; display: block; }

      .sg-footer { padding: 8px 16px; border-top: 1px solid rgba(0, 0, 0, 0.08); font-size: 11px; color: rgba(0, 0, 0, 0.5); flex-shrink: 0; }
      .sg-theme-dark .sg-footer { border-top-color: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.5); }
    `;
  }

  function wireShell(shadowRoot, host) {
    const panel = shadowRoot.querySelector(".sg-panel");
    const backdrop = shadowRoot.querySelector(".sg-backdrop");
    const closeBtn = shadowRoot.querySelector("#sgClose");
    const searchInput = shadowRoot.querySelector("#sgSearch");
    const sortBtn = shadowRoot.querySelector("#sgSort");
    const bgButtons = shadowRoot.querySelectorAll("#sgBgToggle button");
    const fillColorInput = shadowRoot.querySelector("#sgFillColor");
    const strokeColorInput = shadowRoot.querySelector("#sgStrokeColor");
    const colorReset = shadowRoot.querySelector("#sgColorReset");
    const selectAllBtn = shadowRoot.querySelector("#sgSelectAll");
    const batchBtn = shadowRoot.querySelector("#sgBatchDownload");

    function onKeyDown(e) {
      if (e.key === "Escape") cleanupAndClose();
    }
    function cleanupAndClose() {
      document.removeEventListener("keydown", onKeyDown, true);
      host.remove();
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

    fillColorInput.addEventListener("input", () => {
      previewFillColor = fillColorInput.value;
      applyFiltersAndRender(shadowRoot);
    });

    strokeColorInput.addEventListener("input", () => {
      previewStrokeColor = strokeColorInput.value;
      applyFiltersAndRender(shadowRoot);
    });

    colorReset.addEventListener("click", () => {
      previewFillColor = null;
      previewStrokeColor = null;
      fillColorInput.value = "#000000";
      strokeColorInput.value = "#000000";
      applyFiltersAndRender(shadowRoot);
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
