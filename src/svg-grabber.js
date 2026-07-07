(() => {
  const HOST_ID = "__figma_svg_grabber_host__";
  const TOOLBAR_HOST_ID = "__figma_capture_toolbar_host__";
  const MAX_ICONS = 300;
  const BG_SCAN_CHUNK_SIZE = 800;
  const IMG_FETCH_CONCURRENCY = 6;

  const SOURCE_LABELS = { inline: "Inline", img: "Image", background: "Background", sprite: "Sprite" };

  const ICON_TITLE = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>`;
  const ICON_CLOSE = `<svg width="14" height="14" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_COPY = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const ICON_DOWNLOAD = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 14a5 5 0 0 1 0-7.07l1-1a5 5 0 0 1 7.07 7.07l-1 1M14 10a5 5 0 0 1 0 7.07l-1 1a5 5 0 0 1-7.07-7.07l1-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12.5 9.5 17 19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_ERROR = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const iconsByHash = new Map();
  const fallbacksByUrl = new Map();
  let allIcons = [];
  let allFallbacks = [];
  let anonymousCounter = 0;
  let truncatedCount = 0;
  let filterText = "";
  let sortAsc = true;
  let previewColor = null;
  let applyColorToExport = false;

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
    allIcons = [];
    allFallbacks = [];
    anonymousCounter = 0;
    truncatedCount = 0;
  }

  async function runScan(shadowRoot) {
    resetState();
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

  function recolorMarkup(markup, color) {
    return markup.replace(/fill="(?!none)[^"]*"/gi, `fill="${color}"`).replace(/stroke="(?!none)[^"]*"/gi, `stroke="${color}"`);
  }

  function previewMarkup(item) {
    return previewColor ? recolorMarkup(item.markup, previewColor) : item.markup;
  }

  function markupForExport(item) {
    return applyColorToExport && previewColor ? recolorMarkup(item.markup, previewColor) : item.markup;
  }

  function cardHtml(item) {
    const badge = item.count > 1 ? `<span class="sg-count-badge">×${item.count}</span>` : "";
    const sourceLabel = SOURCE_LABELS[item.source] || item.source;
    const label = item.label || "icon";

    const previewInner = item.isFallback
      ? `<img class="sg-fallback-img" src="${escapeAttr(item.originalUrl)}" alt="" />`
      : `<div class="sg-svg-preview">${previewMarkup(item)}</div>`;

    const actions = item.isFallback
      ? `<a class="sg-action-btn" href="${escapeAttr(item.originalUrl)}" target="_blank" rel="noopener noreferrer" title="Open original">${ICON_LINK}</a>`
      : `<button class="sg-action-btn" data-action="copy" data-icon-id="${escapeAttr(item.id)}" title="Copy SVG">${ICON_COPY}</button>
         <button class="sg-action-btn" data-action="download" data-icon-id="${escapeAttr(item.id)}" title="Download .svg">${ICON_DOWNLOAD}</button>`;

    return `
      <div class="sg-card">
        <div class="sg-preview-box">${previewInner}${badge}</div>
        <div class="sg-card-label" title="${escapeAttr(label)}">${escapeHtml(label)}</div>
        <div class="sg-card-footer">
          <span class="sg-source-chip">${sourceLabel}</span>
          <div class="sg-card-actions">${actions}</div>
        </div>
      </div>
    `;
  }

  function applyFiltersAndRender(shadowRoot) {
    const grid = shadowRoot.querySelector("#sgGrid");
    const countEl = shadowRoot.querySelector("#sgCount");
    let items = [...allIcons, ...allFallbacks];

    if (filterText) {
      const q = filterText.toLowerCase();
      items = items.filter((it) => it.label.toLowerCase().includes(q));
    }
    items.sort((a, b) => (sortAsc ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));

    grid.innerHTML = items.length ? items.map(cardHtml).join("") : `<div class="sg-empty">No SVG icons found on this page.</div>`;

    const totalFound = allIcons.length + allFallbacks.length + truncatedCount;
    countEl.textContent = truncatedCount > 0
      ? `Showing ${items.length} of ${totalFound}+ icons found`
      : `${items.length} icon${items.length === 1 ? "" : "s"} found`;

    wireCardActions(shadowRoot);
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
      await navigator.clipboard.writeText(markupForExport(item));
      flashButton(btn, ICON_CHECK);
    } catch (e) {
      flashButton(btn, ICON_ERROR);
    }
  }

  function handleDownload(btn) {
    const item = iconsByHash.get(btn.getAttribute("data-icon-id"));
    if (!item) return;
    const blob = new Blob([markupForExport(item)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(item.label)}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    flashButton(btn, ICON_CHECK);
  }

  function wireCardActions(shadowRoot) {
    shadowRoot.querySelectorAll('.sg-action-btn[data-action="copy"]').forEach((btn) => btn.addEventListener("click", () => handleCopy(btn)));
    shadowRoot.querySelectorAll('.sg-action-btn[data-action="download"]').forEach((btn) => btn.addEventListener("click", () => handleDownload(btn)));
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
            <input class="sg-search" id="sgSearch" type="text" placeholder="Filter icons…" />
            <button class="sg-control-btn" id="sgSort" type="button" title="Sort">A–Z</button>
            <div class="sg-bg-toggle" id="sgBgToggle">
              <button data-bg="light" class="active" type="button">Light</button>
              <button data-bg="dark" type="button">Dark</button>
            </div>
            <label class="sg-color-control" title="Preview color override">
              <input id="sgColor" type="color" value="#000000" />
              <span>Color</span>
            </label>
            <button class="sg-control-btn" id="sgColorReset" type="button">Reset</button>
            <label class="sg-apply-export">
              <input id="sgApplyExport" type="checkbox" />
              <span>Apply to copy/download</span>
            </label>
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

      .sg-panel {
        width: min(1040px, 92vw);
        height: min(720px, 88vh);
        background: rgba(30, 30, 30, 0.96);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.45), 0px 0px 1px 0px rgba(255, 255, 255, 0.15) inset;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.9);
      }

      .sg-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        flex-shrink: 0;
      }

      .sg-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
      .sg-title svg { width: 18px; height: 18px; display: block; flex-shrink: 0; color: #D4FC5D; }

      .sg-close-btn {
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
      }
      .sg-close-btn:hover { background: rgba(255, 255, 255, 0.2); transform: rotate(90deg); }

      .sg-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        flex-wrap: wrap;
        flex-shrink: 0;
      }

      .sg-search {
        flex: 1 1 160px;
        min-width: 120px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.9);
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        padding: 6px 10px;
        outline: none;
      }
      .sg-search::placeholder { color: rgba(255, 255, 255, 0.4); }
      .sg-search:focus { border-color: #D4FC5D; }

      .sg-control-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.9);
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        padding: 6px 10px;
        cursor: pointer;
        white-space: nowrap;
      }
      .sg-control-btn:hover { background: rgba(255, 255, 255, 0.15); }

      .sg-bg-toggle { display: flex; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 6px; overflow: hidden; }
      .sg-bg-toggle button {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        padding: 6px 10px;
        cursor: pointer;
      }
      .sg-bg-toggle button.active { background: #D4FC5D; color: #000000; }

      .sg-color-control { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; }
      .sg-color-control input[type="color"] { width: 22px; height: 22px; border: none; border-radius: 4px; padding: 0; cursor: pointer; background: transparent; }

      .sg-apply-export { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255, 255, 255, 0.6); cursor: pointer; white-space: nowrap; }

      .sg-status { padding: 8px 16px 0; font-size: 12px; color: rgba(255, 255, 255, 0.6); min-height: 18px; flex-shrink: 0; }

      .sg-grid {
        flex: 1;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 16px;
        align-content: start;
      }

      .sg-empty { grid-column: 1 / -1; text-align: center; padding: 40px 0; color: rgba(255, 255, 255, 0.5); font-size: 13px; }

      .sg-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .sg-preview-box {
        position: relative;
        height: 72px;
        border-radius: 6px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: background-color 0.2s ease;
      }
      .sg-grid.sg-preview-dark .sg-preview-box { background: #1c1c1c; }

      .sg-svg-preview { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
      .sg-svg-preview svg { max-width: 100%; max-height: 100%; width: auto; height: auto; }

      .sg-fallback-img { max-width: 32px; max-height: 32px; }

      .sg-count-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.6);
        color: #ffffff;
        font-size: 10px;
        padding: 1px 5px;
        border-radius: 4px;
      }

      .sg-card-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.85);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sg-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 6px; }

      .sg-source-chip {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        padding: 1px 6px;
        white-space: nowrap;
      }

      .sg-card-actions { display: flex; gap: 4px; }

      .sg-action-btn {
        border: none;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
        width: 22px;
        height: 22px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      .sg-action-btn:hover { background: #D4FC5D; color: #000000; }
      .sg-action-btn-success { background: #D4FC5D !important; color: #000000 !important; }
      .sg-action-btn svg { width: 12px; height: 12px; display: block; }

      .sg-footer { padding: 8px 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: rgba(255, 255, 255, 0.5); flex-shrink: 0; }
    `;
  }

  function wireShell(shadowRoot, host) {
    const backdrop = shadowRoot.querySelector(".sg-backdrop");
    const closeBtn = shadowRoot.querySelector("#sgClose");
    const searchInput = shadowRoot.querySelector("#sgSearch");
    const sortBtn = shadowRoot.querySelector("#sgSort");
    const bgButtons = shadowRoot.querySelectorAll("#sgBgToggle button");
    const colorInput = shadowRoot.querySelector("#sgColor");
    const colorReset = shadowRoot.querySelector("#sgColorReset");
    const applyExport = shadowRoot.querySelector("#sgApplyExport");
    const grid = shadowRoot.querySelector("#sgGrid");

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
        grid.classList.toggle("sg-preview-dark", btn.dataset.bg === "dark");
      });
    });

    colorInput.addEventListener("input", () => {
      previewColor = colorInput.value;
      applyFiltersAndRender(shadowRoot);
    });

    colorReset.addEventListener("click", () => {
      previewColor = null;
      applyFiltersAndRender(shadowRoot);
    });

    applyExport.addEventListener("change", () => {
      applyColorToExport = applyExport.checked;
    });
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
