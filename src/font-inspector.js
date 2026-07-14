/**
 * Web to Design Plus - What's the Font Inspector
 */
(() => {
  if (window.figmaFontInspector) return;

  const HOST_ID = "__figma_font_inspector_host__";
  const TOOLBAR_HOST_ID = "__figma_capture_toolbar_host__";
  const isZh = navigator.language.toLowerCase().includes("zh") || (navigator.userLanguage && navigator.userLanguage.toLowerCase().includes("zh"));
  const DEFAULT_SPECIMEN = isZh ? "手把青秧插满田，低头便见水中天。Aa /9527" : "Jackdaws love my big sphinx of quartz.";

  let hostEl = null;
  let shadowRoot = null;
  let isActive = false;
  let currentMode = "inspect";
  let lockedTarget = null;
  let lockedOriginalColor = null;
  let hoveredTarget = null;
  let hoverPill = null;
  let panelEl = null;
  let currentSpecimenText = DEFAULT_SPECIMEN;

  const GOOGLE_FONTS_LIST = new Set([
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Outfit",
    "Source Sans Pro", "Source Sans 3", "Noto Sans", "Oswald", "Raleway",
    "Nunito", "Ubuntu", "Rubik", "Playfair Display", "Merriweather", "PT Sans",
    "Plus Jakarta Sans", "Work Sans", "Fira Sans", "Quicksand", "Manrope",
    "DM Sans", "Space Grotesk", "Syne", "Lexend", "Sora"
  ]);

  function dispatchClose() {
    document.dispatchEvent(new CustomEvent("__figmaFiPanelEvent__", {
      detail: { type: "FI_PANEL_CLOSED" }
    }));
  }

  function restoreLockedColor() {
    if (lockedTarget) {
      try { lockedTarget.style.color = lockedOriginalColor ?? ""; } catch (e) {}
    }
    lockedTarget = null;
    lockedOriginalColor = null;
  }

  function initHost() {
    const existing = document.getElementById(HOST_ID);
    if (existing) {
      hostEl = existing;
      shadowRoot = hostEl.shadowRoot;
      hoverPill = shadowRoot.querySelector(".fi-hover-pill");
      highlightBox = shadowRoot.querySelector(".fi-highlight-box");
      panelEl = shadowRoot.querySelector(".fi-panel");
      return;
    }
    
    hostEl = document.createElement("div");
    hostEl.id = HOST_ID;
    // Must have real dimensions and pointer-events for shadow DOM children to receive clicks
    hostEl.style.cssText = [
      "position:fixed", "top:0", "left:0", "width:100vw", "height:100vh",
      "z-index:2147483646", "pointer-events:none", "overflow:visible"
    ].join(";");
    shadowRoot = hostEl.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = getStyles();
    shadowRoot.appendChild(style);

    hoverPill = document.createElement("div");
    hoverPill.className = "fi-hover-pill";
    shadowRoot.appendChild(hoverPill);

    highlightBox = document.createElement("div");
    highlightBox.className = "fi-highlight-box";
    shadowRoot.appendChild(highlightBox);

    panelEl = document.createElement("div");
    panelEl.className = "fi-panel";
    shadowRoot.appendChild(panelEl);

    document.body.appendChild(hostEl);
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
      restoreLockedColor();
      
      const existing = document.getElementById(HOST_ID);
      if (existing) existing.remove();
      hostEl = null;
      hoverPill = null;
      panelEl = null;
      highlightBox = null;
      hoveredTarget = null;
    }
  }

  function getStyles() {
    return `
      :host {
        all: initial;
        --accent:           #d4fc5d;
        --accent-text:      #000000;
        --bg-panel:         rgba(44, 44, 44, 0.87);
        --bg-btn:           rgba(255, 255, 255, 0.12);
        --bg-subtle:        rgba(255, 255, 255, 0.05);
        --bg-hover:         rgba(255, 255, 255, 0.10);
        --text-primary:     rgba(255, 255, 255, 0.90);
        --text-secondary:   rgba(255, 255, 255, 0.60);
        --text-muted:       rgba(255, 255, 255, 0.45);
        --border:           rgba(255, 255, 255, 0.10);
        --border-strong:    rgba(163, 163, 163, 0.47);
        --shadow:           0px 8px 32px rgba(0,0,0,0.35), 0px 0px 1px rgba(255,255,255,0.15) inset;
        --r-sm: 4px; --r-md: 6px; --r-lg: 8px; --r-xl: 16px;
        --ease: 0.15s cubic-bezier(0.4,0,0.2,1);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }

      /* ─── Pill ────────────────────────────────── */
      .fi-hover-pill {
        position: fixed;
        pointer-events: none;
        background: var(--bg-panel);
        border: 1px solid var(--border-strong);
        border-radius: 999px;
        padding: 5px 12px;
        color: var(--text-primary);
        font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
        box-shadow: var(--shadow);
        display: none; z-index: 20; white-space: nowrap;
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      }

      /* ─── Panel ──────────────────────────────── */
      .fi-panel {
        position: fixed;
        top: 16px; right: 16px;
        width: 320px;
        background: var(--bg-panel);
        border: 1px solid var(--border-strong);
        border-radius: var(--r-xl);
        box-shadow: var(--shadow);
        color: var(--text-primary);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        display: none; flex-direction: column;
        pointer-events: auto;
        z-index: 30;
        overflow: hidden;
        animation: fadein 0.2s cubic-bezier(0.16,1,0.3,1);
      }
      @keyframes fadein {
        from { opacity:0; transform:translateY(-8px) scale(0.97); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }

      /* ─── Header ─────────────────────────────── */
      .fi-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 15px 15px 11px 15px;
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }
      .fi-title {
        font-size: 14px; font-weight: 700; color: var(--text-primary);
        display: flex; align-items: center; gap: 8px; letter-spacing: 0.2px;
      }
      .fi-title-icon {
        background: var(--accent); color: var(--accent-text); border-radius: 4px;
        width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 500;
      }
      .fi-header-actions { display: flex; align-items: center; gap: 5px; }

      /* ─── Buttons ─────────────────────────────── */
      .fi-btn {
        background: var(--bg-btn);
        border: 1px solid var(--border);
        border-radius: var(--r-sm);
        color: var(--text-primary);
        font-size: 12px; font-weight: 600;
        padding: 4px 8px; cursor: pointer;
        transition: background var(--ease);
        display: flex; align-items: center; gap: 4px;
        text-decoration: none; white-space: nowrap;
        font-family: inherit; line-height: 1.5;
      }
      .fi-btn:hover { background: var(--bg-hover); }
      .fi-btn.accent {
        background: var(--accent); color: var(--accent-text);
        border-color: var(--accent); font-weight: 700;
      }
      .fi-btn.accent:hover { opacity: 0.88; }

      .fi-close-btn {
        width: 22px; height: 22px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255, 255, 255, 0.1); border: none; border-radius: 11px;
        color: var(--text-primary); cursor: pointer;
        transition: color var(--ease), background var(--ease);
        flex-shrink: 0;
      }
      .fi-close-btn:hover { background: rgba(255, 255, 255, 0.18); }

      /* ─── Body ───────────────────────────────── */
      .fi-body {
        padding: 15px 15px;
        display: flex; flex-direction: column; gap: 20px;
        max-height: 520px; overflow-y: auto;
        scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;
      }

      /* ─── Specimen ───────────────────────────── */
      .fi-specimen-wrap {
        border: 1px solid var(--border);
        border-radius: var(--r-md);
        padding: 15px;
        display: flex; flex-direction: column; gap: 10px;
      }
      .fi-specimen-text {
        font-size: 16px; line-height: 1.4;
        color: var(--text-primary); word-break: break-all;
        outline: none; min-height: 22px;
      }
      .fi-reset-btn {
        background: transparent; border: none; cursor: pointer;
        color: var(--text-muted); font-size: 9px; font-weight: 600;
        align-self: flex-end; padding: 0;
        transition: color var(--ease); white-space: nowrap; font-family: inherit;
      }
      .fi-reset-btn:hover { color: var(--text-primary); }

      /* ─── Info Cells ─────────────────────────── */
      .fi-label {
        font-size: 10px; font-weight: 500; color: var(--text-muted);
        margin-bottom: 3px; text-align: left;
      }
      .fi-row { display: flex; gap: 10px; }
      .fi-cell { flex: 1; display: flex; flex-direction: column; text-align: left; }
      .fi-val {
        font-size: 14px; font-weight: 600;
        padding: 0;
        color: var(--text-primary); cursor: pointer;
        display: flex; align-items: center; justify-content: flex-start; gap: 5px;
        transition: color var(--ease);
        user-select: none; text-align: left;
      }
      .fi-val:hover { color: rgba(255,255,255,1); }
      .fi-val svg { opacity: 0.45; flex-shrink: 0; }
      .fi-val .spacer { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .fi-copy-hint {
        font-size: 9px; color: var(--accent); opacity: 0;
        transition: opacity 0.1s; font-weight: 700; margin-left: auto; flex-shrink: 0; padding-left: 5px;
      }
      .fi-val:hover .fi-copy-hint { opacity: 1; }



      /* ─── Color swatch ───────────────────────── */
      .fi-swatch {
        width: 11px; height: 11px; border-radius: 2px;
        border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;
      }

      /* ─── Download Card ──────────────────────── */
      .fi-dl-card {
        background: rgba(212,252,93,0.07);
        border: 1px solid rgba(212,252,93,0.18);
        border-radius: var(--r-md);
        padding: 8px 10px;
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
      }
      .fi-dl-title { font-size: 10px; font-weight: 700; color: var(--accent); }
      .fi-dl-sub { font-size: 9px; color: var(--text-muted); }

      /* ─── Audit ──────────────────────────────── */
      .fi-audit-item {
        background: var(--bg-subtle);
        border: 1px solid var(--border); border-radius: var(--r-md);
        padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;
      }
      .fi-audit-header { display: flex; align-items: center; justify-content: space-between; }
      .fi-audit-font { font-size: 12px; font-weight: 700; }
      .fi-audit-count {
        font-size: 9px; font-weight: 600;
        background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 999px;
      }
      .fi-audit-meta {
        font-size: 10px; color: var(--text-secondary);
        display: flex; align-items: center; justify-content: space-between;
      }
      .fi-audit-actions { display: flex; gap: 5px; }

      /* ─── Toast ──────────────────────────────── */
      .fi-toast {
        position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
        background: var(--accent); color: var(--accent-text);
        font-size: 10px; font-weight: 700; padding: 5px 12px;
        border-radius: 999px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        opacity: 0; transition: opacity 0.18s ease;
        pointer-events: none; white-space: nowrap; z-index: 999;
      }
      .fi-toast.show { opacity: 1; }
    `;
  }

  // ─── Utilities ──────────────────────────────────────────────────────────────

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

  function copyText(text, label = "Copied!") {
    navigator.clipboard.writeText(text).then(() => showToast(label));
  }

  function extractCleanFamily(str) {
    if (!str) return "Sans-serif";
    return str.split(",")[0].trim().replace(/^['"`]+|['"`]+$/g, "") || "Sans-serif";
  }

  function sniffFontFiles(targetFamily) {
    const results = [], seen = new Set();
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (!(rule instanceof CSSFontFaceRule)) continue;
            const fam = extractCleanFamily(rule.style.getPropertyValue("font-family"));
            if (targetFamily && fam.toLowerCase() !== targetFamily.toLowerCase()) continue;
            const src = rule.style.getPropertyValue("src") || "";
            const m = src.match(/url\(['""]?([^'"()]+)['""]?\)/i);
            if (!m) continue;
            const url = new URL(m[1], document.baseURI).href;
            if (seen.has(url)) continue;
            seen.add(url);
            const ext = (url.match(/\.(woff2|woff|ttf|otf)(\?.*)?$/i) || ["","woff2"])[1].toUpperCase();
            results.push({ url, ext, family: fam });
          }
        } catch (e) {}
      }
    } catch (e) {}
    try {
      for (const e of performance.getEntriesByType("resource")) {
        if (seen.has(e.name)) continue;
        const m = e.name.match(/\.(woff2|woff|ttf|otf)(\?.*)?$/i);
        if (!m) continue;
        seen.add(e.name);
        results.push({ url: e.name, ext: m[1].toUpperCase(), family: targetFamily || "Web Font" });
      }
    } catch (e) {}
    return results;
  }

  function downloadFont(url, name) {
    const a = document.createElement("a");
    a.href = url; a.download = name || url.split("/").pop().split("?")[0] || "font.woff2";
    a.target = "_blank"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast("Downloading...");
  }

  function isInFiPanel(composedPath) {
    return composedPath.some(n => n === panelEl || n === hostEl);
  }

  function isInToolbar(composedPath) {
    return composedPath.some(n => n && n.id === TOOLBAR_HOST_ID);
  }

  // ─── Close button & specimen input binding ───────────────────────────────────

  
  let isDragging = false;
  let dragStartX, dragStartY, panelStartX, panelStartY;

  function handleMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    let newLeft = panelStartX + dx;
    let newTop = panelStartY + dy;
    
    const rect = panelEl.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));
    
    panelEl.style.left = newLeft + "px";
    panelEl.style.top = newTop + "px";
  }

  function handleMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    const header = panelEl.querySelector(".fi-header");
    if (header) header.style.cursor = "grab";
    document.removeEventListener("mousemove", handleMouseMove, true);
    document.removeEventListener("mouseup", handleMouseUp, true);
  }

  function bindDrag() {
    console.log("FI_DRAG_INIT: bindDrag is executing! v3");
    if (!panelEl) return;
    const header = panelEl.querySelector(".fi-header");
    if (!header) return;
    
    header.style.cursor = "grab";
    header.onmousedown = (e) => {
      // Robustly get the panel element from the event target's parent, ignoring global closure
      const activePanel = e.currentTarget.closest(".fi-panel");
      if (!activePanel) return;

      if (e.target.closest && (e.target.closest("button") || e.target.closest(".fi-btn") || e.target.closest(".fi-close-btn"))) return;
      if (e.button !== 0) return;
      
      e.preventDefault();
      const rect = activePanel.getBoundingClientRect();
      panelStartX = rect.left;
      panelStartY = rect.top;
      
      activePanel.style.right = "auto";
      activePanel.style.bottom = "auto";
      activePanel.style.left = panelStartX + "px";
      activePanel.style.top = panelStartY + "px";
      
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      
      e.currentTarget.style.cursor = "grabbing";
      
      const onMove = (moveEv) => {
        if (!isDragging) return;
        const dx = moveEv.clientX - dragStartX;
        const dy = moveEv.clientY - dragStartY;
        let newLeft = panelStartX + dx;
        let newTop = panelStartY + dy;
        
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const pRect = activePanel.getBoundingClientRect();
        newLeft = Math.max(0, Math.min(newLeft, winW - pRect.width));
        newTop = Math.max(0, Math.min(newTop, winH - pRect.height));
        
        activePanel.style.left = newLeft + "px";
        activePanel.style.top = newTop + "px";
      };

      const onUp = () => {
        isDragging = false;
        if (header) header.style.cursor = "grab";
        window.removeEventListener("mousemove", onMove, true);
        window.removeEventListener("mouseup", onUp, true);
      };

      window.addEventListener("mousemove", onMove, true);
      window.addEventListener("mouseup", onUp, true);
    };
  }

  function bindPanel() {
    bindDrag();
    
    if (!panelEl) return;
    const closeBtn = panelEl.querySelector("#fiBtnClose");
    if (closeBtn) {
      const doClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        restoreLockedColor();
        toggle(false);
        dispatchClose();
      };
      // Use mousedown to bypass websites that cancel 'click' events via e.preventDefault() on mousedown
      closeBtn.onmousedown = doClose;
      closeBtn.onclick = doClose;
    }

    // Specimen custom text input
    const specimenText = panelEl.querySelector("#fiSpecimenText");
    const resetBtn = panelEl.querySelector("#fiResetBtn");

    if (specimenText) {
      specimenText.addEventListener("focus", () => {
        if (specimenText.textContent.trim() === DEFAULT_SPECIMEN) {
          specimenText.textContent = "";
        }
      });
      specimenText.addEventListener("blur", () => {
        if (specimenText.textContent.trim() === "") {
          specimenText.textContent = DEFAULT_SPECIMEN;
          currentSpecimenText = DEFAULT_SPECIMEN;
        }
      });
      specimenText.addEventListener("input", () => {
        const val = specimenText.textContent.trim();
        currentSpecimenText = val || DEFAULT_SPECIMEN;
      });
      specimenText.addEventListener("keydown", e => e.stopPropagation());
      specimenText.addEventListener("click", e => e.stopPropagation());
      specimenText.addEventListener("mousedown", e => e.stopPropagation());
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentSpecimenText = DEFAULT_SPECIMEN;
        if (specimenText) specimenText.textContent = DEFAULT_SPECIMEN;
      });
    }
  }

  function closeHtml() {
    return `<button class="fi-close-btn" id="fiBtnClose" title="Close">
      <svg width="12" height="12" viewBox="0 0 8 8" fill="none" style="display:block; pointer-events:none;">
        <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;
  }

  // ─── Render Inspect Card ────────────────────────────────────────────────────

  function renderInspectCard(el) {
    const cs = window.getComputedStyle(el);
    const rawFamily = cs.fontFamily;
    const safeFamily = rawFamily.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const cleanFamily = extractCleanFamily(rawFamily);
    const weight = cs.fontWeight;
    const size = cs.fontSize;
    const lineHt = cs.lineHeight;
    const letterSp = cs.letterSpacing;
    const color = cs.color;
    const textAlign = cs.textAlign;
    const fontStyle = cs.fontStyle;
    const textTransform = cs.textTransform;
    const textDecoration = cs.textDecoration;

    const weightMap = {
      "100":"Thin · 100","200":"ExtraLight · 200","300":"Light · 300",
      "400":"Regular · 400","500":"Medium · 500","600":"SemiBold · 600",
      "700":"Bold · 700","800":"ExtraBold · 800","900":"Black · 900",
      "normal":"Regular · 400","bold":"Bold · 700"
    };
    const weightLabel = weightMap[weight] || weight;
    const isGF = GOOGLE_FONTS_LIST.has(cleanFamily);
    const fontFiles = sniffFontFiles(cleanFamily);
    const bestFile = fontFiles[0] || null;
    const cssText = `font-family: ${rawFamily};\nfont-weight: ${weight};\nfont-size: ${size};\nline-height: ${lineHt};\nletter-spacing: ${letterSp};\ncolor: ${color};`;

    panelEl.innerHTML = `
      <div class="fi-header">
        <div class="fi-title">
          <div class="fi-title-icon">Aa</div>
          Typography
        </div>
          <div class="fi-header-actions">
            <button class="fi-btn" id="fiBtnAudit">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              Fonts list
            </button>
            ${closeHtml()}
          </div>
      </div>

      <div class="fi-body">
        <!-- Specimen preview -->
        <div class="fi-specimen-wrap">
          <div class="fi-specimen-text" id="fiSpecimenText" contenteditable="true" spellcheck="false"
            style="font-family:${safeFamily}; font-weight:${weight}; font-style:${fontStyle}; letter-spacing:${letterSp}; text-transform:${textTransform}; text-decoration:${textDecoration}; text-align:${textAlign};"
          >${currentSpecimenText}</div>
          <button class="fi-reset-btn" id="fiResetBtn">Reset</button>
        </div>

        <!-- Font Family -->
        <div class="fi-cell" style="width:100%">
          <div class="fi-label">Font Family</div>
          <div class="fi-val" id="fiCopyFamily">
            <span class="spacer">${cleanFamily}</span>
            <span class="fi-copy-hint">Copy</span>
          </div>
        </div>

        <!-- Weight & Size -->
        <div class="fi-row">
          <div class="fi-cell">
            <div class="fi-label">Weight</div>
            <div class="fi-val" id="fiCopyWeight">
              <span class="spacer">${weightLabel}</span>
              <span class="fi-copy-hint">Copy</span>
            </div>
          </div>
          <div class="fi-cell">
            <div class="fi-label">Size</div>
            <div class="fi-val" id="fiCopySize">
              <span class="spacer">${size}</span>
              <span class="fi-copy-hint">Copy</span>
            </div>
          </div>
        </div>

        <!-- Line Height & Letter Spacing -->
        <div class="fi-row">
          <div class="fi-cell">
            <div class="fi-label">Line Height</div>
            <div class="fi-val" id="fiCopyLineHt">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 8l4-4 4 4M7 4v16M13 6h8M13 12h8M13 18h8"/>
              </svg>
              <span class="spacer">${lineHt}</span>
              <span class="fi-copy-hint">Copy</span>
            </div>
          </div>
          <div class="fi-cell">
            <div class="fi-label">Letter Spacing</div>
            <div class="fi-val" id="fiCopyLetterSp">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12h20M6 8l-4 4 4 4M18 8l4 4-4 4"/>
              </svg>
              <span class="spacer">${letterSp}</span>
              <span class="fi-copy-hint">Copy</span>
            </div>
          </div>
        </div>

        <!-- Fill Color -->
        <div class="fi-cell" style="width:100%">
          <div class="fi-label">Fill</div>
          <div class="fi-val" id="fiCopyColor">
            <span class="fi-swatch" style="background:${color};"></span>
            <span class="spacer" style="font-size:10px;">${color}</span>
            <span class="fi-copy-hint">Copy</span>
          </div>
        </div>

      </div>
      <div class="fi-footer" style="display:flex; align-items:center; justify-content:space-between; padding: 13px 15px 15px 15px; border-top: 1px solid var(--border); flex-shrink: 0;">
        <div class="fi-dl-info" style="opacity: 0.5; font-size: 14px; font-weight: 400;">
          ${bestFile ? `.${bestFile.ext.toUpperCase()}` : ''}
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          ${isGF ? `<a class="fi-btn" style="padding: 4px 7px; display: flex; align-items: center;" href="https://fonts.google.com/specimen/${encodeURIComponent(cleanFamily)}" target="_blank" title="View on Google Fonts"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 28 28"><g><path fill="#fbbc04" d="m14.217 3.647-.542-.651L0 23.833h9.442l4.244-6.467.53-1.15z"></path><path fill="#1a73e8" d="M22.14 2.996h-8.465v20.837h8.465z"></path><path fill="#ea4335" d="M4.558 10.81a3.907 3.907 0 1 0 0-7.814 3.907 3.907 0 0 0 0 7.814"></path><path fill="#0d652d" d="M22.79 17.973c0 3.236 2.586 5.86-.65 5.86a5.861 5.861 0 0 1 0-11.72c3.236 0 .65 2.623.65 5.86"></path><path fill="#174ea6" d="M17.582 7.554a4.56 4.56 0 0 1 4.558-4.558c2.517 0 .814 2.041.814 4.558s1.703 4.558-.814 4.558a4.56 4.56 0 0 1-4.558-4.558"></path><path fill="#1a73e8" d="M22.14 2.996a4.559 4.559 0 0 1 0 9.116"></path><path fill="#34a853" d="M22.14 12.112a5.861 5.861 0 0 1 0 11.721"></path></g></svg></a>` : ""}
          <button class="fi-btn" id="fiBtnCopyCss">Copy CSS</button>
          ${bestFile ? `<button class="fi-btn accent" id="fiBtnDl">↓ ${bestFile.ext.toUpperCase()}</button>` : ""}
        </div>
      </div>
    </div>
      `;

    bindPanel();
    panelEl.querySelector("#fiBtnCopyCss").onmousedown = () => copyText(cssText, "Copied CSS!");
    panelEl.querySelector("#fiBtnAudit").onmousedown = () => switchMode("audit");
    panelEl.querySelector("#fiCopyFamily").onmousedown = () => copyText(cleanFamily);
    panelEl.querySelector("#fiCopyWeight").onmousedown = () => copyText(weight);
    panelEl.querySelector("#fiCopySize").onmousedown = () => copyText(size);
    panelEl.querySelector("#fiCopyLineHt").onmousedown = () => copyText(lineHt);
    panelEl.querySelector("#fiCopyLetterSp").onmousedown = () => copyText(letterSp);
    panelEl.querySelector("#fiCopyColor").onmousedown = () => copyText(color);
    const dlBtn = panelEl.querySelector("#fiBtnDl");
    if (dlBtn && bestFile) dlBtn.onmousedown = () => downloadFont(bestFile.url, `${cleanFamily}.${bestFile.ext.toLowerCase()}`);
  }

  // ─── Render Audit List ──────────────────────────────────────────────────────

  function renderAuditList() {
    const statsMap = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode(n) {
        if (n.id === HOST_ID || n.id === TOOLBAR_HOST_ID) return NodeFilter.FILTER_REJECT;
        return (n.innerText && n.innerText.trim()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    let n;
    while ((n = walker.nextNode())) {
      const cs = window.getComputedStyle(n);
      const fam = extractCleanFamily(cs.fontFamily);
      const key = `${fam}::${cs.fontWeight}`;
      if (!statsMap.has(key)) statsMap.set(key, { family: fam, weight: cs.fontWeight, count: 0 });
      statsMap.get(key).count++;
    }

    const list = Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
    const allFiles = sniffFontFiles();

    panelEl.innerHTML = `
      <div class="fi-header">
        <div class="fi-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:0.75;">
            <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/>
          </svg>
          Fonts List (${list.length})
        </div>
        <div class="fi-header-actions">
          <button class="fi-btn" id="fiBtnBack">← Back</button>
          ${closeHtml()}
        </div>
      </div>
      <div class="fi-body">
        ${list.map(item => {
          const gf = GOOGLE_FONTS_LIST.has(item.family);
          const file = allFiles.find(f => f.family.toLowerCase() === item.family.toLowerCase()) || allFiles[0] || null;
          return `<div class="fi-audit-item">
            <div class="fi-audit-header">
              <span class="fi-audit-font" style="font-family:${item.family}">${item.family}</span>
              <span class="fi-audit-count">${item.count}</span>
            </div>
            <div class="fi-audit-meta">
              <span>Weight ${item.weight}</span>
                <div class="fi-audit-actions">
                  ${gf ? `<a class="fi-btn" style="padding: 2px 4px; display: flex; align-items: center;" href="https://fonts.google.com/specimen/${encodeURIComponent(item.family)}" target="_blank" title="View on Google Fonts"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 28 28"><g><path fill="#fbbc04" d="m14.217 3.647-.542-.651L0 23.833h9.442l4.244-6.467.53-1.15z"></path><path fill="#1a73e8" d="M22.14 2.996h-8.465v20.837h8.465z"></path><path fill="#ea4335" d="M4.558 10.81a3.907 3.907 0 1 0 0-7.814 3.907 3.907 0 0 0 0 7.814"></path><path fill="#0d652d" d="M22.79 17.973c0 3.236 2.586 5.86-.65 5.86a5.861 5.861 0 0 1 0-11.72c3.236 0 .65 2.623.65 5.86"></path><path fill="#174ea6" d="M17.582 7.554a4.56 4.56 0 0 1 4.558-4.558c2.517 0 .814 2.041.814 4.558s1.703 4.558-.814 4.558a4.56 4.56 0 0 1-4.558-4.558"></path><path fill="#1a73e8" d="M22.14 2.996a4.559 4.559 0 0 1 0 9.116"></path><path fill="#34a853" d="M22.14 12.112a5.861 5.861 0 0 1 0 11.721"></path></g></svg></a>` : ""}
                  ${file ? `<button class="fi-btn accent fi-audit-dl" data-url="${file.url}" data-name="${item.family}.${file.ext.toLowerCase()}">↓ ${file.ext}</button>` : ""}
                  <button class="fi-btn fi-audit-copy" data-family="${item.family}">Copy</button>
                </div>
            </div>
          </div>`;
        }).join("")}
      </div>
    `;

    bindPanel();
    panelEl.querySelector("#fiBtnBack").onmousedown = () => switchMode("inspect");
    panelEl.querySelectorAll(".fi-audit-copy").forEach(b => {
      b.onmousedown = () => copyText(b.dataset.family);
    });
    panelEl.querySelectorAll(".fi-audit-dl").forEach(b => {
      b.onmousedown = () => downloadFont(b.dataset.url, b.dataset.name);
    });
  }

  // ─── Mode Switch ─────────────────────────────────────────────────────────────

  function switchMode(mode) {
    currentMode = mode;
    
    // Safety fallback: if panelEl is lost but hostEl exists, re-fetch it
    if (!panelEl && hostEl && hostEl.shadowRoot) {
      panelEl = hostEl.shadowRoot.querySelector('.fi-panel');
    }
    
    if (mode === "audit") {
      if (hoverPill) hoverPill.style.display = "none";
      if (panelEl) panelEl.style.display = "flex";
      renderAuditList();
    } else {
      if (lockedTarget) {
        if (panelEl) panelEl.style.display = "flex";
        renderInspectCard(lockedTarget);
      } else {
        if (panelEl) panelEl.style.display = "none";
      }
    }
  }

  // ─── Mouse/Click Events ───────────────────────────────────────────────────────

  function onMouseMove(e) {
    if (!isActive || currentMode !== "inspect") return;
    // Ignore if inside our panel or main toolbar
    if (isInFiPanel(e.composedPath()) || isInToolbar(e.composedPath())) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;

    if (target !== hoveredTarget) {
      hoveredTarget = target;
      const cs = window.getComputedStyle(target);
      const family = extractCleanFamily(cs.fontFamily);
      hoverPill.style.display = "block";
      hoverPill.textContent = `${family}  ·  ${cs.fontWeight}  ·  ${cs.fontSize}`;
    }
    hoverPill.style.left = `${Math.min(e.clientX + 14, window.innerWidth - 230)}px`;
    hoverPill.style.top = `${Math.max(e.clientY - 32, 8)}px`;
  }

  function onClick(e) {
    if (!isActive) return;
    const path = e.composedPath();

    // Click inside fi-panel → let it handle itself (don't interfere)
    if (isInFiPanel(path)) return;

    // Click inside main toolbar → ignore
    if (isInToolbar(path)) return;

    e.preventDefault();
    e.stopPropagation();

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;

    // Restore previous locked element color
    restoreLockedColor();

    // Color highlight disabled per user request
    lockedTarget = target;
    hoverPill.style.display = "none";
    hoveredTarget = null;
    panelEl.style.display = "flex";
    renderInspectCard(lockedTarget);
  }

  // ─── Toggle ──────────────────────────────────────────────────────────────────

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
      restoreLockedColor();
      if (hostEl) {
        hostEl.remove();
        hostEl = null;
      }
      hoverPill = null;
      panelEl = null;
      hoveredTarget = null;
    }
  }

  window.figmaFontInspector = {
    toggle,
    isActive: () => isActive
  };
})();
