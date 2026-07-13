/**
 * Web to Design Plus - What's the Font Inspector
 * 1:1 Replica of Figma Native Typography Panel, Live Inspect Pill Tooltip,
 * Full Page Font Audit, and Web Font File (.woff2/.ttf) Sniffer & Downloader.
 */
(() => {
  if (window.figmaFontInspector) return;

  const HOST_ID = "__figma_font_inspector_host__";
  let hostEl = null;
  let shadowRoot = null;
  let isActive = false;
  let currentMode = "inspect"; // 'inspect' | 'audit'
  let lockedTarget = null;
  let hoveredTarget = null;
  let highlightBox = null;
  let hoverPill = null;
  let panelEl = null;

  // Common Google Fonts list for instant specimen matching
  const GOOGLE_FONTS_LIST = new Set([
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Outfit",
    "Source Sans Pro", "Source Sans 3", "Noto Sans", "Oswald", "Raleway",
    "Nunito", "Ubuntu", "Rubik", "Playfair Display", "Merriweather", "PT Sans",
    "Plus Jakarta Sans", "Work Sans", "Fira Sans", "Quicksand", "Manrope",
    "DM Sans", "Space Grotesk", "Syne", "Lexend", "Sora"
  ]);

  function initHost() {
    if (hostEl && document.body.contains(hostEl)) return { hostEl, shadowRoot };
    hostEl = document.createElement("div");
    hostEl.id = HOST_ID;
    hostEl.style.cssText = "position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483646; pointer-events: none;";
    shadowRoot = hostEl.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = getStyles();
    shadowRoot.appendChild(style);

    // Highlight border box for inspect hover
    highlightBox = document.createElement("div");
    highlightBox.className = "fi-highlight-box";
    shadowRoot.appendChild(highlightBox);

    // Floating inspect hover pill
    hoverPill = document.createElement("div");
    hoverPill.className = "fi-hover-pill";
    shadowRoot.appendChild(hoverPill);

    // Main Card / Panel
    panelEl = document.createElement("div");
    panelEl.className = "fi-panel";
    shadowRoot.appendChild(panelEl);

    document.documentElement.appendChild(hostEl);
    return { hostEl, shadowRoot };
  }

  function getStyles() {
    return `
      :host {
        all: initial;
        --token-color-accent: #d4fc5d;
        --token-color-accent-text: #000000;
        --token-bg-panel: rgba(24, 24, 27, 0.95);
        --token-bg-card: rgba(39, 39, 42, 0.9);
        --token-bg-input: rgba(255, 255, 255, 0.07);
        --token-bg-hover: rgba(255, 255, 255, 0.12);
        --token-border-default: rgba(255, 255, 255, 0.12);
        --token-text-primary: rgba(255, 255, 255, 0.95);
        --token-text-secondary: rgba(255, 255, 255, 0.65);
        --token-text-muted: rgba(255, 255, 255, 0.45);
        --token-radius-sm: 4px;
        --token-radius-md: 6px;
        --token-radius-lg: 10px;
        --token-radius-xl: 14px;
        --token-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      .fi-highlight-box {
        position: fixed;
        pointer-events: none;
        border: 2px solid var(--token-color-accent);
        background: rgba(212, 252, 93, 0.08);
        border-radius: var(--token-radius-sm);
        display: none;
        z-index: 10;
        transition: all 0.08s ease-out;
      }

      .fi-hover-pill {
        position: fixed;
        pointer-events: none;
        background: var(--token-bg-panel);
        border: 1px solid var(--token-border-default);
        border-radius: 999px;
        padding: 5px 12px;
        color: var(--token-text-primary);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.3px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: none;
        z-index: 11;
        white-space: nowrap;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .fi-panel {
        position: fixed;
        top: 80px;
        right: 24px;
        width: 320px;
        background: var(--token-bg-panel);
        border: 1px solid var(--token-border-default);
        border-radius: var(--token-radius-xl);
        box-shadow: var(--token-shadow);
        color: var(--token-text-primary);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: none;
        flex-direction: column;
        pointer-events: auto;
        z-index: 100;
        overflow: hidden;
        animation: fi-fade-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes fi-fade-in {
        from { opacity: 0; transform: translateY(-8px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* Header */
      .fi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border-bottom: 1px solid var(--token-border-default);
      }

      .fi-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--token-text-primary);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .fi-header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .fi-btn {
        background: var(--token-bg-input);
        border: 1px solid var(--token-border-default);
        border-radius: var(--token-radius-sm);
        color: var(--token-text-primary);
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        cursor: pointer;
        transition: background 0.15s ease;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .fi-btn:hover {
        background: var(--token-bg-hover);
      }
      .fi-btn.primary {
        background: var(--token-color-accent);
        color: var(--token-color-accent-text);
        border-color: var(--token-color-accent);
      }
      .fi-btn.primary:hover {
        opacity: 0.9;
      }

      /* Body */
      .fi-body {
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 480px;
        overflow-y: auto;
      }

      /* Figma Typography Native Field Rows */
      .fi-field-row {
        display: flex;
        gap: 8px;
      }
      .fi-field {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .fi-field-label {
        font-size: 10px;
        font-weight: 600;
        color: var(--token-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }

      .fi-input-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--token-bg-input);
        border: 1px solid var(--token-border-default);
        border-radius: var(--token-radius-md);
        padding: 7px 10px;
        font-size: 12px;
        font-weight: 500;
        color: var(--token-text-primary);
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease;
        user-select: none;
      }
      .fi-input-box:hover {
        background: var(--token-bg-hover);
        border-color: rgba(255, 255, 255, 0.25);
      }

      .fi-icon-label {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .fi-icon-label svg {
        opacity: 0.55;
        flex-shrink: 0;
      }

      /* Alignment group */
      .fi-align-group {
        display: flex;
        background: var(--token-bg-input);
        border: 1px solid var(--token-border-default);
        border-radius: var(--token-radius-md);
        overflow: hidden;
      }
      .fi-align-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 0;
        cursor: pointer;
        color: var(--token-text-secondary);
        transition: background 0.15s, color 0.15s;
      }
      .fi-align-btn.active {
        background: rgba(255, 255, 255, 0.14);
        color: var(--token-text-primary);
      }

      /* Color swatch */
      .fi-color-swatch {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        border: 1px solid rgba(255,255,255,0.25);
        flex-shrink: 0;
      }

      /* Sniffer Download section */
      .fi-dl-card {
        background: rgba(212, 252, 93, 0.08);
        border: 1px solid rgba(212, 252, 93, 0.25);
        border-radius: var(--token-radius-md);
        padding: 10px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 4px;
      }
      .fi-dl-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
      }
      .fi-dl-title {
        font-size: 11px;
        font-weight: 700;
        color: var(--token-color-accent);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fi-dl-sub {
        font-size: 10px;
        color: var(--token-text-secondary);
      }

      /* Audit List Mode */
      .fi-audit-item {
        background: var(--token-bg-input);
        border: 1px solid var(--token-border-default);
        border-radius: var(--token-radius-md);
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .fi-audit-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .fi-audit-font {
        font-size: 13px;
        font-weight: 700;
        color: var(--token-text-primary);
      }
      .fi-audit-count {
        font-size: 10px;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 999px;
      }
      .fi-audit-meta {
        font-size: 11px;
        color: var(--token-text-secondary);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      /* Toast Notification */
      .fi-toast {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--token-color-accent);
        color: var(--token-color-accent-text);
        font-size: 11px;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 999px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }
      .fi-toast.show {
        opacity: 1;
      }
    `;
  }

  function showToast(msg) {
    let toast = shadowRoot.querySelector(".fi-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "fi-toast";
      panelEl.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function copyText(text, toastMsg = "Copied!") {
    navigator.clipboard.writeText(text).then(() => showToast(toastMsg));
  }

  function extractCleanFamily(fontFamilyStr) {
    if (!fontFamilyStr) return "Sans-serif";
    const parts = fontFamilyStr.split(",");
    let first = parts[0].trim();
    first = first.replace(/^['"]+|['"]+$/g, "");
    return first || "Sans-serif";
  }

  // Sniff real font file urls (.woff2, .woff, .ttf, .otf) from page
  function sniffFontFiles(targetFamily) {
    const results = [];
    const seenUrls = new Set();

    // 1. Scan @font-face rules
    try {
      for (const sheet of document.styleSheets) {
        try {
          const rules = sheet.cssRules || [];
          for (const rule of rules) {
            if (rule instanceof CSSFontFaceRule) {
              const ruleFamily = extractCleanFamily(rule.style.getPropertyValue("font-family"));
              const src = rule.style.getPropertyValue("src") || "";
              if (!targetFamily || ruleFamily.toLowerCase() === targetFamily.toLowerCase()) {
                // Extract url(...)
                const urlMatch = src.match(/url\(['"]?([^'"()]+)['"]?\)/i);
                if (urlMatch && urlMatch[1]) {
                  const fullUrl = new URL(urlMatch[1], document.baseURI).href;
                  if (!seenUrls.has(fullUrl)) {
                    seenUrls.add(fullUrl);
                    const extMatch = fullUrl.match(/\.(woff2|woff|ttf|otf)(\?.*)?$/i);
                    const ext = extMatch ? extMatch[1].toUpperCase() : "WOFF2";
                    results.push({ url: fullUrl, ext, family: ruleFamily });
                  }
                }
              }
            }
          }
        } catch (e) {
          // CORS stylesheet block - ignore
        }
      }
    } catch (e) {}

    // 2. Scan Performance resource entries for matching fonts
    try {
      const entries = performance.getEntriesByType("resource");
      for (const entry of entries) {
        if (!seenUrls.has(entry.name)) {
          const match = entry.name.match(/\.(woff2|woff|ttf|otf)(\?.*)?$/i);
          if (match) {
            seenUrls.add(entry.name);
            results.push({
              url: entry.name,
              ext: match[1].toUpperCase(),
              family: targetFamily || "Web Font"
            });
          }
        }
      }
    } catch (e) {}

    return results;
  }

  function downloadFontFile(url, fileName) {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || url.split("/").pop().split("?")[0] || "font.woff2";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloading Font...");
  }

  function renderInspectCard(el) {
    const cs = window.getComputedStyle(el);
    const rawFamily = cs.fontFamily;
    const cleanFamily = extractCleanFamily(rawFamily);
    const weight = cs.fontWeight;
    const size = cs.fontSize;
    const lineHt = cs.lineHeight;
    const letterSp = cs.letterSpacing;
    const color = cs.color;
    const textAlign = cs.textAlign;

    // Map weight label
    const weightMap = {
      "100": "Thin (100)", "200": "Extra Light (200)", "300": "Light (300)",
      "400": "Regular (400)", "500": "Medium (500)", "600": "Semi Bold (600)",
      "700": "Bold (700)", "800": "Extra Bold (800)", "900": "Black (900)",
      "normal": "Regular (400)", "bold": "Bold (700)"
    };
    const weightLabel = weightMap[weight] || `${weight}`;

    const isGoogleFont = GOOGLE_FONTS_LIST.has(cleanFamily);
    const fontFiles = sniffFontFiles(cleanFamily);
    const bestFontFile = fontFiles.length > 0 ? fontFiles[0] : null;

    const cssRuleText = `font-family: ${rawFamily};\nfont-weight: ${weight};\nfont-size: ${size};\nline-height: ${lineHt};\nletter-spacing: ${letterSp};\ncolor: ${color};`;

    panelEl.innerHTML = `
      <div class="fi-header">
        <div class="fi-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
          </svg>
          Typography
        </div>
        <div class="fi-header-actions">
          ${isGoogleFont ? `
            <a class="fi-btn" href="https://fonts.google.com/specimen/${encodeURIComponent(cleanFamily)}" target="_blank" title="Open Google Fonts">
              GF ↗
            </a>
          ` : ""}
          <button class="fi-btn" id="fiBtnCopyCss" title="Copy Typography CSS">Copy CSS</button>
          <button class="fi-btn primary" id="fiBtnAudit" title="Page Font Audit">Audit</button>
        </div>
      </div>

      <div class="fi-body">
        <!-- Full-width Font Family -->
        <div class="fi-field">
          <span class="fi-field-label">Font Family</span>
          <div class="fi-input-box" id="fiCopyFamily" title="Click to copy font family">
            <span>${cleanFamily}</span>
            <span style="font-size:10px; color:var(--token-text-muted);">▼</span>
          </div>
        </div>

        <!-- Row 2: Weight & Size -->
        <div class="fi-field-row">
          <div class="fi-field">
            <span class="fi-field-label">Weight</span>
            <div class="fi-input-box" id="fiCopyWeight" title="Click to copy font weight">
              <span>${weightLabel}</span>
            </div>
          </div>
          <div class="fi-field">
            <span class="fi-field-label">Size</span>
            <div class="fi-input-box" id="fiCopySize" title="Click to copy font size">
              <span>${size}</span>
            </div>
          </div>
        </div>

        <!-- Row 3: Line Height & Letter Spacing -->
        <div class="fi-field-row">
          <div class="fi-field">
            <span class="fi-field-label">Line Height</span>
            <div class="fi-input-box" id="fiCopyLineHt" title="Click to copy line height">
              <div class="fi-icon-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 8l4-4 4 4M7 4v16M13 6h8M13 12h8M13 18h8"/>
                </svg>
                <span>${lineHt}</span>
              </div>
            </div>
          </div>
          <div class="fi-field">
            <span class="fi-field-label">Letter Spacing</span>
            <div class="fi-input-box" id="fiCopyLetterSp" title="Click to copy letter spacing">
              <div class="fi-icon-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12h20M6 8l-4 4 4 4M18 8l4 4-4 4"/>
                </svg>
                <span>${letterSp}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 4: Alignment & Fill Color -->
        <div class="fi-field-row">
          <div class="fi-field">
            <span class="fi-field-label">Alignment</span>
            <div class="fi-align-group">
              <div class="fi-align-btn ${textAlign === "left" || textAlign === "start" ? "active" : ""}">Left</div>
              <div class="fi-align-btn ${textAlign === "center" ? "active" : ""}">Center</div>
              <div class="fi-align-btn ${textAlign === "right" || textAlign === "end" ? "active" : ""}">Right</div>
            </div>
          </div>
          <div class="fi-field">
            <span class="fi-field-label">Fill</span>
            <div class="fi-input-box" id="fiCopyColor" title="Click to copy fill color">
              <div class="fi-icon-label">
                <span class="fi-color-swatch" style="background:${color};"></span>
                <span>${color}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Web Font Sniffer & Direct Downloader -->
        ${bestFontFile ? `
          <div class="fi-dl-card">
            <div class="fi-dl-info">
              <span class="fi-dl-title">Web Font Source (${bestFontFile.ext})</span>
              <span class="fi-dl-sub">Available for download</span>
            </div>
            <button class="fi-btn primary" id="fiBtnDownloadFont">
              ↓ Download
            </button>
          </div>
        ` : ""}
      </div>
    `;

    // Bind event handlers
    panelEl.querySelector("#fiBtnCopyCss").onclick = () => copyText(cssRuleText, "Copied CSS!");
    panelEl.querySelector("#fiBtnAudit").onclick = () => switchMode("audit");

    panelEl.querySelector("#fiCopyFamily").onclick = () => copyText(cleanFamily, "Copied Family!");
    panelEl.querySelector("#fiCopyWeight").onclick = () => copyText(weight, "Copied Weight!");
    panelEl.querySelector("#fiCopySize").onclick = () => copyText(size, "Copied Size!");
    panelEl.querySelector("#fiCopyLineHt").onclick = () => copyText(lineHt, "Copied Line Height!");
    panelEl.querySelector("#fiCopyLetterSp").onclick = () => copyText(letterSp, "Copied Spacing!");
    panelEl.querySelector("#fiCopyColor").onclick = () => copyText(color, "Copied Color!");

    const dlBtn = panelEl.querySelector("#fiBtnDownloadFont");
    if (dlBtn && bestFontFile) {
      dlBtn.onclick = () => downloadFontFile(bestFontFile.url, `${cleanFamily}.${bestFontFile.ext.toLowerCase()}`);
    }
  }

  function renderAuditList() {
    const statsMap = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        if (node.id === HOST_ID || node.closest?.("." + HOST_ID) || node.closest?.(".wrapper-outer")) {
          return NodeFilter.FILTER_REJECT;
        }
        return (node.innerText && node.innerText.trim().length > 0) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });

    let node;
    while ((node = walker.nextNode())) {
      const cs = window.getComputedStyle(node);
      const family = extractCleanFamily(cs.fontFamily);
      const weight = cs.fontWeight;
      const key = `${family}::${weight}`;
      if (!statsMap.has(key)) {
        statsMap.set(key, { family, weight, count: 0 });
      }
      statsMap.get(key).count += 1;
    }

    const sortedList = Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
    const allFonts = sniffFontFiles();

    panelEl.innerHTML = `
      <div class="fi-header">
        <div class="fi-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
          </svg>
          Page Font Audit (${sortedList.length})
        </div>
        <div class="fi-header-actions">
          <button class="fi-btn" id="fiBtnInspectMode">← Inspect</button>
        </div>
      </div>
      <div class="fi-body">
        ${sortedList.map(item => {
          const isGF = GOOGLE_FONTS_LIST.has(item.family);
          const matchedFile = allFonts.find(f => f.family.toLowerCase() === item.family.toLowerCase()) || (allFonts.length > 0 ? allFonts[0] : null);
          return `
            <div class="fi-audit-item">
              <div class="fi-audit-header">
                <span class="fi-audit-font">${item.family}</span>
                <span class="fi-audit-count">${item.count} elements</span>
              </div>
              <div class="fi-audit-meta">
                <span>Weight: ${item.weight}</span>
                <div style="display:flex; gap:6px;">
                  ${isGF ? `<a class="fi-btn" href="https://fonts.google.com/specimen/${encodeURIComponent(item.family)}" target="_blank">GF ↗</a>` : ""}
                  ${matchedFile ? `<button class="fi-btn primary fi-audit-dl" data-url="${matchedFile.url}" data-name="${item.family}.${matchedFile.ext.toLowerCase()}">↓ ${matchedFile.ext}</button>` : ""}
                  <button class="fi-btn fi-audit-copy" data-family="${item.family}">Copy</button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    panelEl.querySelector("#fiBtnInspectMode").onclick = () => switchMode("inspect");
    panelEl.querySelectorAll(".fi-audit-copy").forEach(btn => {
      btn.onclick = () => copyText(btn.dataset.family, "Copied Family!");
    });
    panelEl.querySelectorAll(".fi-audit-dl").forEach(btn => {
      btn.onclick = () => downloadFontFile(btn.dataset.url, btn.dataset.name);
    });
  }

  function switchMode(mode) {
    currentMode = mode;
    if (mode === "audit") {
      highlightBox.style.display = "none";
      hoverPill.style.display = "none";
      renderAuditList();
    } else {
      if (lockedTarget) {
        renderInspectCard(lockedTarget);
      } else {
        panelEl.style.display = "none";
      }
    }
  }

  function onMouseMove(e) {
    if (!isActive || currentMode !== "inspect") return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target.closest("#" + HOST_ID) || target.closest(".wrapper-outer")) return;

    if (target !== hoveredTarget) {
      hoveredTarget = target;
      const cs = window.getComputedStyle(target);
      const family = extractCleanFamily(cs.fontFamily);
      const size = cs.fontSize;
      const weight = cs.fontWeight;

      const rect = target.getBoundingClientRect();
      highlightBox.style.display = "block";
      highlightBox.style.left = `${rect.left}px`;
      highlightBox.style.top = `${rect.top}px`;
      highlightBox.style.width = `${rect.width}px`;
      highlightBox.style.height = `${rect.height}px`;

      hoverPill.style.display = "block";
      hoverPill.textContent = `${family} • ${weight} • ${size}`;
      hoverPill.style.left = `${Math.min(e.clientX + 14, window.innerWidth - 200)}px`;
      hoverPill.style.top = `${Math.max(e.clientY - 30, 10)}px`;
    } else if (hoverPill.style.display === "block") {
      hoverPill.style.left = `${Math.min(e.clientX + 14, window.innerWidth - 200)}px`;
      hoverPill.style.top = `${Math.max(e.clientY - 30, 10)}px`;
    }
  }

  function onClick(e) {
    if (!isActive) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target.closest("#" + HOST_ID) || target.closest(".wrapper-outer")) return;

    e.preventDefault();
    e.stopPropagation();

    lockedTarget = target;
    panelEl.style.display = "flex";
    renderInspectCard(lockedTarget);
  }

  function toggle(activate) {
    initHost();
    isActive = typeof activate === "boolean" ? activate : !isActive;

    if (isActive) {
      currentMode = "inspect";
      window.addEventListener("mousemove", onMouseMove, true);
      window.addEventListener("click", onClick, true);
    } else {
      window.removeEventListener("mousemove", onMouseMove, true);
      window.removeEventListener("click", onClick, true);
      highlightBox.style.display = "none";
      hoverPill.style.display = "none";
      panelEl.style.display = "none";
      lockedTarget = null;
      hoveredTarget = null;
    }
  }

  window.figmaFontInspector = {
    toggle,
    isActive: () => isActive
  };
})();
