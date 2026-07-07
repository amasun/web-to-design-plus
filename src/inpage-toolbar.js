(() => {
  const HOST_ID = "__figma_capture_toolbar_host__";
  const HIGHLIGHT_ID = "__figma_capture_highlight__";

  let isSelectionModeActive = false;

  function removeExisting() {
    const oldHost = document.getElementById(HOST_ID);
    if (oldHost) oldHost.remove();
    const oldHighlight = document.getElementById(HIGHLIGHT_ID);
    if (oldHighlight) oldHighlight.remove();
    const oldHighlightStyle = document.getElementById(HIGHLIGHT_ID + "_style");
    if (oldHighlightStyle) oldHighlightStyle.remove();
  }

  function injectGoogleFonts() {
    const fontId = "__figma_fonts__";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:ital,wght@1,800&display=swap";
      document.head.appendChild(link);
    }
  }

  function getStyleContent() {
    return `
      .wrapper-outer {
        position: fixed;
        top: 16px;
        right: 16px;
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
        z-index: 2147483647;
        pointer-events: auto;
        user-select: none;
        transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                    width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                    height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        box-sizing: border-box;

        /* Shared background card styling */
        background: rgba(44, 44, 44, 0.87);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 
          0px 8px 32px 0px rgba(0, 0, 0, 0.35), 
          0px 0px 1px 0px rgba(255, 255, 255, 0.15) inset;
      }
      
      /* Glassmorphism Container */
      .popup-container {
        width: max-content;
        height: max-content;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
      }

      /* Header */
      .logo-section {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 12px;
        height: 44px;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        box-sizing: border-box;
        cursor: grab;
      }

      .logo-text {
        position: absolute;
        left: 81px;
        top: 14px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 800;
        font-style: italic;
        font-size: 12px;
        line-height: 16px;
        color: rgba(255, 255, 255, 0.9);
        letter-spacing: 0.06px;
        white-space: nowrap;
      }

      .plus-icon {
        position: absolute;
        left: 176.5px;
        top: 11.34px;
        display: block;
        width: 12.83px;
        height: 12.83px;
      }

      .close-btn {
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        transform: rotate(90deg);
      }

      /* Grid Area */
      .grid-section {
        display: grid;
        grid-template-columns: repeat(2, 120px);
        gap: 10px;
        padding: 0 12px;
        box-sizing: border-box;
        height: 154px;
      }

      /* Button Layout */
      .action-btn {
        position: relative;
        width: 120px;
        height: 72px;
        background: rgba(255, 255, 255, 0.12);
        border: none;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px 10px;
        box-sizing: border-box;
        color: rgba(255, 255, 255, 0.9);
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        outline: none;
        transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
                    color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .action-btn:not(.disabled):hover {
        background: #d4fc5d;
        color: #000000;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(212, 252, 93, 0.35);
      }

      .action-btn:not(.disabled):active {
        transform: scale(0.97) translateY(0);
      }

      .btn-icon {
        display: block;
        flex-shrink: 0;
        color: currentColor;
      }

      .btn-icon path {
        transition: fill 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                    stroke 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-label {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        color: inherit;
        letter-spacing: 0.06px;
        margin-top: 4px;
        white-space: nowrap;
      }

      /* Disabled/Soon button state */
      .action-btn.disabled {
        background: rgba(192, 206, 231, 0.08);
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
        pointer-events: none;
      }

      .soon-badge {
        position: absolute;
        top: 3px;
        right: 3px;
        height: 16px;
        border: 1px solid rgba(163, 163, 163, 0.47);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        box-sizing: border-box;
        font-size: 10px;
        font-weight: 400;
        line-height: 1;
        color: rgba(255, 255, 255, 0.9);
        opacity: 0.6;
      }

      /* Footer styling */
      .footer-section {
        padding: 0 12px;
        height: 44px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom-left-radius: 16px;
        border-bottom-right-radius: 16px;
        box-sizing: border-box;
      }

      .footer-credit {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        color: white;
        opacity: 0.6;
        letter-spacing: 0.06px;
      }

      .info-icon {
        display: block;
        flex-shrink: 0;
      }

      .info-link {
        display: flex;
        flex-shrink: 0;
        line-height: 0;
        cursor: pointer;
        opacity: 0.85;
        transition: opacity 0.2s ease;
      }

      .info-link:hover {
        opacity: 1;
      }

      /* Capsule Styles (Overlay/Toasts/Selection) */
      .capsule-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: max-content;
        height: 40px;
        padding: 0 12px;
        gap: 12px;
        box-sizing: border-box;
      }

      .capsule-left-group {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 100%;
        box-sizing: border-box;
      }

      .capsule-label {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 500;
        line-height: 16px;
        color: rgba(255, 255, 255, 0.9);
        letter-spacing: 0.06px;
        white-space: nowrap;
      }



      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top: 2px solid rgba(255, 255, 255, 0.95);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        box-sizing: border-box;
        margin-left: 6px;
        margin-right: 4px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .capturing-capsule {
        justify-content: flex-start;
        gap: 8px;
        padding-left: 10px;
      }

      .icon-error {
        color: #f87171; /* red-400 */
        display: block;
        flex-shrink: 0;
      }
    `;
  }

  function getHighlightStyleContent() {
    return `
      #${HIGHLIGHT_ID} {
        position: absolute;
        pointer-events: none;
        border: 2px solid #38bdf8; /* Sky-400 */
        background: rgba(56, 189, 248, 0.08);
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        z-index: 2147483646;
        border-radius: 4px;
        display: none;
      }
    `;
  }

  function setupDragging(wrapper, shadowRoot) {
    let isDragging = false;
    let startX, startY;
    let startLeft, startTop;

    function handleMouseMove(e) {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;
      
      const rect = wrapper.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      newLeft = Math.max(0, Math.min(newLeft, maxX));
      newTop = Math.max(0, Math.min(newTop, maxY));
      
      wrapper.style.left = `${newLeft}px`;
      wrapper.style.top = `${newTop}px`;
    }

    function handleMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      const handle = shadowRoot.querySelector(".logo-section");
      if (handle) handle.style.cursor = "grab";
      wrapper.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("mouseup", handleMouseUp, true);
    }

    wrapper.addEventListener("mousedown", (e) => {
      const path = e.composedPath();
      const isHeaderClick = path.some(el => el.classList && el.classList.contains("logo-section"));
      const isCloseBtn = path.some(el => el.id === "figmaBtnClose" || (el.classList && el.classList.contains("close-btn")));
      
      if (!isHeaderClick || isCloseBtn || e.button !== 0) return;
      
      const rect = wrapper.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      
      wrapper.style.left = `${startLeft}px`;
      wrapper.style.top = `${startTop}px`;
      wrapper.style.right = "auto";
      wrapper.style.transition = "none";
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const handle = shadowRoot.querySelector(".logo-section");
      if (handle) handle.style.cursor = "grabbing";
      
      document.addEventListener("mousemove", handleMouseMove, true);
      document.addEventListener("mouseup", handleMouseUp, true);
      
      e.preventDefault();
    });
  }

  function getOrCreateHost() {
    let host = document.getElementById(HOST_ID);
    let shadowRoot, wrapper;
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      host.setAttribute("data-figma-capture-ignore", "1");
      host.setAttribute("data-h2d-ignore", "true");
      
      shadowRoot = host.attachShadow({ mode: "open" });
      
      const style = document.createElement("style");
      style.textContent = getStyleContent();
      shadowRoot.appendChild(style);
      
      wrapper = document.createElement("div");
      wrapper.className = "wrapper-outer";
      shadowRoot.appendChild(wrapper);
      
      setupDragging(wrapper, shadowRoot);
      
      if (document.body) {
        document.body.appendChild(host);
      } else {
        document.documentElement.appendChild(host);
      }
    } else {
      shadowRoot = host.shadowRoot;
      wrapper = shadowRoot.querySelector(".wrapper-outer");
    }
    return { host, shadowRoot, wrapper };
  }

  function setWrapperContent(wrapper, html) {
    const hasContent = wrapper.childElementCount > 0;
    const firstRect = wrapper.getBoundingClientRect();

    wrapper.innerHTML = html;

    if (!hasContent) return;

    // Measure the natural size of the new content, unconstrained.
    wrapper.style.width = "";
    wrapper.style.height = "";
    const lastRect = wrapper.getBoundingClientRect();

    if (Math.abs(firstRect.width - lastRect.width) < 1 && Math.abs(firstRect.height - lastRect.height) < 1) {
      return;
    }

    // Pin to the old size, then force a reflow so the transition has a "from" state to animate from.
    wrapper.style.width = `${firstRect.width}px`;
    wrapper.style.height = `${firstRect.height}px`;
    wrapper.offsetHeight;

    const clearInline = () => {
      wrapper.style.width = "";
      wrapper.style.height = "";
      wrapper.removeEventListener("transitionend", onEnd);
    };
    function onEnd(e) {
      if (e.target === wrapper && (e.propertyName === "width" || e.propertyName === "height")) {
        clearInline();
      }
    }
    wrapper.addEventListener("transitionend", onEnd);

    requestAnimationFrame(() => {
      wrapper.style.width = `${lastRect.width}px`;
      wrapper.style.height = `${lastRect.height}px`;
    });
  }

  function injectHighlightStyle() {
    let style = document.getElementById(HIGHLIGHT_ID + "_style");
    if (!style) {
      style = document.createElement("style");
      style.id = HIGHLIGHT_ID + "_style";
      style.textContent = getHighlightStyleContent();
      document.documentElement.appendChild(style);
    }
  }

  function showMainPanel(isInitial = false) {
    const { shadowRoot, wrapper } = getOrCreateHost();

    setWrapperContent(wrapper, `
      <div class="popup-container">
        <!-- Header -->
        <header class="logo-section">
          <div>
            <span class="logo-text">Web to Design</span>
            <!-- plus icon (20:87) -->
            <svg class="plus-icon" width="12.83" height="12.83" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.61 7.2452H9.38615C8.11941 7.24552 6.86104 8.24623 6.57601 9.48049L6.07576 11.6473H4.54669L5.04695 9.48049C5.52199 7.4232 7.6187 5.75565 9.73012 5.75532H11.9539L11.61 7.2452ZM7.95209 3.52003C7.47687 5.57732 5.38038 7.24511 3.26891 7.2452H1.04509L1.38906 5.75532H3.61288C4.87967 5.75524 6.13781 4.7543 6.42302 3.52003L6.92328 1.35321H8.45234L7.95209 3.52003Z" fill="#FF5E2F"/>
            </svg>
          </div>
          <!-- close button (20:88) -->
          <button class="close-btn" id="figmaBtnClose" type="button" title="Close">
            <svg width="12" height="12" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </header>

        <!-- Grid Buttons -->
        <main class="grid-section">
          <!-- Entire screen -->
          <button class="action-btn" id="btnEntire" type="button">
            <!-- page icon -->
            <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 6C17.5304 6 18.0391 6.21071 18.4142 6.58579C18.7893 6.96086 19 7.46957 19 8V16L18.99 16.204C18.9429 16.6615 18.7396 17.0889 18.4143 17.414C18.089 17.7391 17.6616 17.9422 17.204 17.989L17 18H7L6.796 17.99C6.33847 17.9429 5.91115 17.7396 5.58601 17.414C5.26087 17.089 5.0578 16.6616 5.011 16.204L5 16V8C5 7.46957 5.21071 6.96086 5.58579 6.58579C5.96086 6.21071 6.46957 6 7 6H17ZM6 16C6 16.2652 6.10536 16.5196 6.29289 16.7071C6.48043 16.8946 6.73478 17 7 17H17C17.2652 17 17.5196 16.8946 17.7071 16.7071C17.8946 16.5196 18 16.2652 18 16V11H6V16ZM7 7C6.75256 6.99992 6.51388 7.09158 6.3301 7.25726C6.14632 7.42294 6.03049 7.65088 6.005 7.897L6 8V10H18V8C18 7.73478 17.8946 7.48043 17.7071 7.29289C17.5196 7.10536 17.2652 7 17 7H7ZM7.5 8C7.63261 8 7.75979 8.05268 7.85355 8.14645C7.94732 8.24021 8 8.36739 8 8.5C8 8.63261 7.94732 8.75979 7.85355 8.85355C7.75979 8.94732 7.63261 9 7.5 9C7.36739 9 7.24021 8.94732 7.14645 8.85355C7.05268 8.75979 7 8.63261 7 8.5C7 8.36739 7.05268 8.24021 7.14645 8.14645C7.24021 8.05268 7.36739 8 7.5 8ZM9.5 8C9.63261 8 9.75979 8.05268 9.85355 8.14645C9.94732 8.24021 10 8.36739 10 8.5C10 8.63261 9.94732 8.75979 9.85355 8.85355C9.75979 8.94732 9.63261 9 9.5 9C9.36739 9 9.24021 8.94732 9.14645 8.85355C9.05268 8.75979 9 8.63261 9 8.5C9 8.36739 9.05268 8.24021 9.14645 8.14645C9.24021 8.05268 9.36739 8 9.5 8Z" fill="currentColor"/>
            </svg>
            <span class="btn-label">Entire screen</span>
          </button>

          <!-- Select element -->
          <button class="action-btn" id="btnElement" type="button">
            <!-- click icon -->
            <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.321 5.53202C9.44341 5.48133 9.58093 5.48129 9.70337 5.53192C9.8258 5.58254 9.92314 5.67969 9.974 5.80202L10.751 7.67802C10.853 7.92302 10.712 8.20202 10.466 8.30402C10.22 8.40602 9.929 8.30602 9.827 8.06002L9.05 6.18602C9.02477 6.1253 9.01177 6.06019 9.01175 5.99443C9.01172 5.92867 9.02466 5.86356 9.04983 5.80281C9.075 5.74206 9.11191 5.68687 9.15844 5.64041C9.20498 5.59394 9.26022 5.55711 9.321 5.53202ZM8.061 9.82702L6.186 9.05002C6.06347 8.99924 5.92578 8.9992 5.803 9.04993C5.68067 9.10066 5.58329 9.19799 5.5325 9.32052C5.48171 9.44305 5.48168 9.58074 5.53241 9.7033C5.58314 9.82585 5.68047 9.92324 5.803 9.97402L7.678 10.751C7.924 10.852 8.202 10.711 8.304 10.466C8.406 10.22 8.307 9.93002 8.061 9.82702ZM7.678 13.248L5.803 14.024C5.68047 14.0748 5.58314 14.1722 5.53241 14.2948C5.48168 14.4173 5.48171 14.555 5.5325 14.6775C5.58329 14.8001 5.68067 14.8974 5.80323 14.9481C5.92578 14.9988 6.06347 14.9988 6.186 14.948L8.061 14.171C8.307 14.069 8.406 13.778 8.304 13.532C8.202 13.286 7.924 13.146 7.678 13.248ZM9.827 15.938L9.05 17.812C9.02485 17.8727 9.0119 17.9377 9.01188 18.0034C9.01187 18.0691 9.02479 18.1341 9.04991 18.1948C9.07503 18.2555 9.11185 18.3106 9.15828 18.3571C9.20471 18.4035 9.25983 18.4404 9.3205 18.4655C9.38117 18.4907 9.4462 18.5036 9.51188 18.5036C9.57755 18.5037 9.64259 18.4907 9.70327 18.4656C9.76396 18.4405 9.8191 18.4037 9.86555 18.3572C9.912 18.3108 9.94885 18.2557 9.974 18.195L10.751 16.32C10.853 16.075 10.711 15.796 10.466 15.694C10.221 15.592 9.929 15.692 9.827 15.938ZM16.322 10.75L18.196 9.97302C18.2578 9.94873 18.3141 9.91237 18.3617 9.86607C18.4093 9.81977 18.4472 9.76446 18.4731 9.70336C18.4991 9.64227 18.5127 9.57661 18.513 9.51022C18.5133 9.44383 18.5004 9.37804 18.4751 9.31669C18.4497 9.25533 18.4124 9.19965 18.3653 9.15287C18.3181 9.1061 18.2622 9.06918 18.2007 9.04426C18.1391 9.01935 18.0732 9.00694 18.0068 9.00775C17.9405 9.00857 17.8749 9.0226 17.814 9.04902L15.939 9.82602C15.693 9.92702 15.593 10.219 15.695 10.465C15.797 10.711 16.076 10.851 16.322 10.75ZM14.172 8.06002L14.949 6.18502C14.9998 6.06249 14.9998 5.92481 14.9491 5.80225C14.8984 5.6797 14.801 5.58231 14.6785 5.53152C14.556 5.48074 14.4183 5.4807 14.2957 5.53143C14.1732 5.58216 14.0758 5.67949 14.025 5.80202L13.249 7.67702C13.147 7.92202 13.288 8.20102 13.533 8.30302C13.779 8.40502 14.071 8.30502 14.173 8.05902M12.353 11.061C12.1731 10.9934 11.9776 10.979 11.7898 11.0196C11.6019 11.0602 11.4298 11.154 11.2939 11.2899C11.158 11.4258 11.0642 11.598 11.0236 11.7858C10.983 11.9736 10.9974 12.1692 11.065 12.349L13.315 18.349C13.39 18.5485 13.5269 18.7188 13.7055 18.8351C13.8842 18.9514 14.0953 19.0075 14.3081 18.9954C14.5209 18.9832 14.7242 18.9033 14.8885 18.7675C15.0527 18.6316 15.1692 18.4468 15.221 18.24L15.826 15.822L18.244 15.218C18.4511 15.1664 18.6362 15.0498 18.7723 14.8854C18.9084 14.721 18.9883 14.5174 19.0004 14.3043C19.0124 14.0912 18.956 13.8799 18.8394 13.7012C18.7227 13.5224 18.5519 13.3857 18.352 13.311L12.353 11.061ZM16.293 14.675L15 15L14.677 16.29L14.25 18L13.632 16.35L12.466 13.242L12 12L13.243 12.466L16.351 13.631L18 14.25L16.293 14.675Z" fill="currentColor"/>
            </svg>
            <span class="btn-label">Select element</span>
          </button>

          <!-- Grab SVG (Disabled) -->
          <button class="action-btn disabled" id="btnGrabSvg" type="button" disabled>
            <div class="soon-badge">Soon</div>
            <!-- tabler:vector-bezier icon -->
            <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.2887 9.00525C9.1505 9.19475 8.10931 9.76218 7.33312 10.616C6.55693 11.4698 6.09101 12.5602 6.01052 13.7113M13.7113 9.00525C14.8495 9.19475 15.8907 9.76218 16.6669 10.616C17.4431 11.4698 17.909 12.5602 17.9895 13.7113M10.2887 8.57743H5.15488M5.15488 8.57743C5.15488 8.80436 5.06474 9.02199 4.90427 9.18246C4.74381 9.34292 4.52617 9.43307 4.29924 9.43307C4.07231 9.43307 3.85468 9.34292 3.69421 9.18246C3.53375 9.02199 3.4436 8.80436 3.4436 8.57743C3.4436 8.3505 3.53375 8.13286 3.69421 7.9724C3.85468 7.81194 4.07231 7.72179 4.29924 7.72179C4.52617 7.72179 4.74381 7.81194 4.90427 7.9724C5.06474 8.13286 5.15488 8.3505 5.15488 8.57743ZM18.8451 8.57743H13.7113M18.8451 8.57743C18.8451 8.80436 18.9353 9.02199 19.0957 9.18246C19.2562 9.34292 19.4738 9.43307 19.7008 9.43307C19.9277 9.43307 20.1453 9.34292 20.3058 9.18246C20.4662 9.02199 20.5564 8.80436 20.5564 8.57743C20.5564 8.3505 20.4662 8.13286 20.3058 7.9724C20.1453 7.81194 19.9277 7.72179 19.7008 7.72179C19.4738 7.72179 19.2562 7.81194 19.0957 7.9724C18.9353 8.13286 18.8451 8.3505 18.8451 8.57743ZM4.29924 14.5669C4.29924 14.34 4.38939 14.1223 4.54985 13.9619C4.71032 13.8014 4.92795 13.7113 5.15488 13.7113H6.86616C7.09309 13.7113 7.31073 13.8014 7.47119 13.9619C7.63165 14.1223 7.7218 14.34 7.7218 14.5669V16.2782C7.7218 16.5051 7.63165 16.7228 7.47119 16.8832C7.31073 17.0437 7.09309 17.1338 6.86616 17.1338H5.15488C4.92795 17.1338 4.71032 17.0437 4.54985 16.8832C4.38939 16.7228 4.29924 16.5051 4.29924 16.2782V14.5669ZM16.2782 14.5669C16.2782 14.34 16.3683 14.1223 16.5288 13.9619C16.6893 13.8014 16.9069 13.7113 17.1338 13.7113H18.8451C19.072 13.7113 19.2897 13.8014 19.4501 13.9619C19.6106 14.1223 19.7008 14.34 19.7008 14.5669V16.2782C19.7008 16.5051 19.6106 16.7228 19.4501 16.8832C19.2897 17.0437 19.072 17.1338 18.8451 17.1338H17.1338C16.9069 17.1338 16.6893 17.0437 16.5288 16.8832C16.3683 16.7228 16.2782 16.5051 16.2782 16.2782V14.5669ZM10.2887 7.72179C10.2887 7.49486 10.3789 7.27722 10.5393 7.11676C10.6998 6.9563 10.9174 6.86615 11.1444 6.86615H12.8556C13.0826 6.86615 13.3002 6.9563 13.4607 7.11676C13.6211 7.27722 13.7113 7.49486 13.7113 7.72179V9.43307C13.7113 9.66 13.6211 9.87763 13.4607 10.0381C13.3002 10.1986 13.0826 10.2887 12.8556 10.2887H11.1444C10.9174 10.2887 10.6998 10.1986 10.5393 10.0381C10.3789 9.87763 10.2887 9.66 10.2887 9.43307V7.72179Z" stroke="currentColor" stroke-opacity="0.9" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="btn-label">Grab SVG</span>
          </button>

          <!-- What's the Font (Disabled) -->
          <button class="action-btn disabled" id="btnWhatsFont" type="button" disabled>
            <div class="soon-badge">Soon</div>
            <!-- ci:font icon -->
            <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 18L8 6L3 18M11 14H5M21 18V15M21 15V12M21 15C21 15.7956 20.6839 16.5587 20.1213 17.1213C19.5587 17.6839 18.7956 18 18 18C17.2044 18 16.4413 17.6839 15.8787 17.1213C15.3161 16.5587 15 15.7956 15 15C15 14.2044 15.3161 13.4413 15.8787 12.8787C16.4413 12.3161 17.2044 12 18 12C18.7956 12 19.5587 12.3161 20.1213 12.8787C20.6839 13.4413 21 14.2044 21 15Z" stroke="currentColor" stroke-opacity="0.9" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="btn-label">What's the Font</span>
          </button>
        </main>

        <!-- Footer -->
        <footer class="footer-section">
          <span class="footer-credit">By Artgineer</span>
          <!-- Xiaohongshu logo brand icon (20:102) -->
          <a class="info-link" href="https://www.xiaohongshu.com/user/profile/5c094b50f7e8b948da476607" target="_blank" rel="noopener noreferrer" title="Follow on Xiaohongshu">
            <svg class="info-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_20_102)">
                <path d="M4 0H12C14.6667 0 16 1.33333 16 4V12C16 14.6667 14.6667 16 12 16H4C1.33333 16 0 14.6667 0 12V4C0 1.33333 1.33333 0 4 0Z" fill="#F24E1E"/>
                <path d="M6.966 11.9733C7.03134 11.8307 7.086 11.7067 7.14534 11.586C7.28001 11.3362 7.40129 11.0794 7.50867 10.8167C7.53628 10.7 7.60884 10.5988 7.71057 10.5353C7.81231 10.4718 7.935 10.4509 8.052 10.4773C8.39534 10.502 8.74 10.484 9.09867 10.484V6.01334C8.85734 6.01334 8.61934 6.00468 8.38334 6.01334C8.21867 6.02201 8.16067 5.96801 8.166 5.79201C8.17734 5.36868 8.166 4.94401 8.166 4.50134H11.5133V5.52801C11.5133 6.01068 11.5133 6.01068 11.0453 6.01068H10.5747V10.4787H11.5907C12 10.4787 12 10.4787 12 10.9087V11.8093C12 11.934 11.9693 11.9973 11.834 11.9973C10.2453 11.9947 8.656 11.9927 7.06734 11.994C7.033 11.9899 6.99909 11.9827 6.966 11.9727" fill="white"/>
                <path d="M7.59933 8.73667C7.39 9.168 7.206 9.55333 7.01267 9.932C6.99611 9.95351 6.97493 9.97102 6.9507 9.98325C6.92647 9.99548 6.8998 10.0021 6.87267 10.0027C6.40733 10.0027 5.93933 10.0207 5.47533 9.986C5.01067 9.95133 4.82467 9.65267 5.01 9.19667C5.22067 8.67067 5.47467 8.162 5.71 7.64667L5.76333 7.50867C5.57533 7.50867 5.41067 7.51333 5.246 7.50867C5.112 7.51067 4.978 7.498 4.84733 7.472C4.72481 7.45524 4.61384 7.39079 4.53857 7.29267C4.46329 7.19455 4.42979 7.07069 4.44533 6.948C4.45125 6.89312 4.46658 6.83967 4.49067 6.79C4.77267 6.11267 5.08867 5.44867 5.39333 4.78133C5.49267 4.56267 5.59667 4.34733 5.70867 4.13467C5.73733 4.07933 5.804 4.00867 5.85533 4.00667C6.29067 3.996 6.72733 4.00133 7.202 4.00133C7.16067 4.10733 7.13733 4.17933 7.106 4.24667C6.83933 4.80467 6.572 5.362 6.30333 5.918C6.24933 6.03067 6.18333 6.148 6.386 6.234C6.43933 5.944 6.658 5.99667 6.84867 5.99667H7.94867C7.90267 6.10667 7.87267 6.18333 7.83933 6.256C7.49933 6.966 7.154 7.67067 6.81933 8.38C6.682 8.66867 6.728 8.73933 7.048 8.742C7.21267 8.73733 7.37933 8.73667 7.59933 8.73667ZM7.00067 10.4847C6.74267 11.002 6.512 11.4673 6.276 11.93C6.2622 11.9493 6.24427 11.9653 6.22351 11.9769C6.20276 11.9884 6.1797 11.9952 6.156 11.9967C5.52333 11.99 4.88933 11.978 4.25467 11.9613C4.16765 11.9482 4.08228 11.9259 4 11.8947L4.35467 11.1773C4.47 10.94 4.58267 10.704 4.70733 10.4787C4.72373 10.4518 4.74586 10.4289 4.77214 10.4116C4.79842 10.3944 4.82819 10.3831 4.85933 10.3787C5.44067 10.4073 6.022 10.448 6.604 10.4833C6.72 10.4893 6.83067 10.4847 7.00067 10.4847Z" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_20_102">
                  <rect width="16" height="16" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </a>
        </footer>
      </div>
    `);

    const btnEntire = shadowRoot.querySelector("#btnEntire");
    const btnElement = shadowRoot.querySelector("#btnElement");
    const btnClose = shadowRoot.querySelector("#figmaBtnClose");

    btnEntire.addEventListener("click", () => {
      showCapturingIndicator();
      chrome.runtime.sendMessage({ type: "FIGMA_RUN_ENTIRE_SCREEN_CAPTURE" });
    });

    btnElement.addEventListener("click", () => {
      showSelectionIndicator();
      activateElementSelection();
    });

    btnClose.addEventListener("click", () => {
      removeExisting();
    });

    showIndicator(isInitial);
  }

  function showSelectionIndicator() {
    const { shadowRoot, wrapper } = getOrCreateHost();
    injectHighlightStyle();

    setWrapperContent(wrapper, `
      <div class="capsule-container selection-capsule">
        <div class="capsule-left-group">
          <!-- click pointer icon (22:134) -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="display:block; flex-shrink:0;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.321 5.53202C9.44341 5.48133 9.58093 5.48129 9.70337 5.53192C9.8258 5.58254 9.92314 5.67969 9.974 5.80202L10.751 7.67802C10.853 7.92302 10.712 8.20202 10.466 8.30402C10.22 8.40602 9.929 8.30602 9.827 8.06002L9.05 6.18602C9.02477 6.1253 9.01177 6.06019 9.01175 5.99443C9.01172 5.92867 9.02466 5.86356 9.04983 5.80281C9.075 5.74206 9.11191 5.68687 9.15844 5.64041C9.20498 5.59394 9.26022 5.55711 9.321 5.53202ZM8.061 9.82702L6.186 9.05002C6.06347 8.99924 5.92578 8.9992 5.803 9.04993C5.68067 9.10066 5.58329 9.19799 5.5325 9.32052C5.48171 9.44305 5.48168 9.58074 5.53241 9.7033C5.58314 9.82585 5.68047 9.92324 5.803 9.97402L7.678 10.751C7.924 10.852 8.202 10.711 8.304 10.466C8.406 10.22 8.307 9.93002 8.061 9.82702ZM7.678 13.248L5.803 14.024C5.68047 14.0748 5.58314 14.1722 5.53241 14.2948C5.48168 14.4173 5.48171 14.555 5.5325 14.6775C5.58329 14.8001 5.68067 14.8974 5.80323 14.9481C5.92578 14.9988 6.06347 14.9988 6.186 14.948L8.061 14.171C8.307 14.069 8.406 13.778 8.304 13.532C8.202 13.286 7.924 13.146 7.678 13.248ZM9.827 15.938L9.05 17.812C9.02485 17.8727 9.0119 17.9377 9.01188 18.0034C9.01187 18.0691 9.02479 18.1341 9.04991 18.1948C9.07503 18.2555 9.11185 18.3106 9.15828 18.3571C9.20471 18.4035 9.25983 18.4404 9.3205 18.4655C9.38117 18.4907 9.4462 18.5036 9.51188 18.5036C9.57755 18.5037 9.64259 18.4907 9.70327 18.4656C9.76396 18.4405 9.8191 18.4037 9.86555 18.3572C9.912 18.3108 9.94885 18.2557 9.974 18.195L10.751 16.32C10.853 16.075 10.711 15.796 10.466 15.694C10.221 15.592 9.929 15.692 9.827 15.938ZM16.322 10.75L18.196 9.97302C18.2578 9.94873 18.3141 9.91237 18.3617 9.86607C18.4093 9.81977 18.4472 9.76446 18.4731 9.70336C18.4991 9.64227 18.5127 9.57661 18.513 9.51022C18.5133 9.44383 18.5004 9.37804 18.4751 9.31669C18.4497 9.25533 18.4124 9.19965 18.3653 9.15287C18.3181 9.1061 18.2622 9.06918 18.2007 9.04426C18.1391 9.01935 18.0732 9.00694 18.0068 9.00775C17.9405 9.00857 17.8749 9.0226 17.814 9.04902L15.939 9.82602C15.693 9.92702 15.593 10.219 15.695 10.465C15.797 10.711 16.076 10.851 16.322 10.75ZM14.172 8.06002L14.949 6.18502C14.9998 6.06249 14.9998 5.92481 14.9491 5.80225C14.8984 5.6797 14.801 5.58231 14.6785 5.53152C14.556 5.48074 14.4183 5.4807 14.2957 5.53143C14.1732 5.58216 14.0758 5.67949 14.025 5.80202L13.249 7.67702C13.147 7.92202 13.288 8.20102 13.533 8.30302C13.779 8.40502 14.071 8.30502 14.173 8.05902M12.353 11.061C12.1731 10.9934 11.9776 10.979 11.7898 11.0196C11.6019 11.0602 11.4298 11.154 11.2939 11.2899C11.158 11.4258 11.0642 11.598 11.0236 11.7858C10.983 11.9736 10.9974 12.1692 11.065 12.349L13.315 18.349C13.39 18.5485 13.5269 18.7188 13.7055 18.8351C13.8842 18.9514 14.0953 19.0075 14.3081 18.9954C14.5209 18.9832 14.7242 18.9033 14.8885 18.7675C15.0527 18.6316 15.1692 18.4468 15.221 18.24L15.826 15.822L18.244 15.218C18.4511 15.1664 18.6362 15.0498 18.7723 14.8854C18.9084 14.721 18.9883 14.5174 19.0004 14.3043C19.0124 14.0912 18.956 13.8799 18.8394 13.7012C18.7227 13.5224 18.5519 13.3857 18.352 13.311L12.353 11.061ZM16.293 14.675L15 15L14.677 16.29L14.25 18L13.632 16.35L12.466 13.242L12 12L13.243 12.466L16.351 13.631L18 14.25L16.293 14.675Z" fill="#D4FC5D"/>
          </svg>
          <span class="capsule-label">Select an element to capture</span>
        </div>
        <button class="close-btn" id="figmaCancelBtn" type="button" title="Cancel">
          <svg width="12" height="12" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
            <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `);

    shadowRoot.querySelector("#figmaCancelBtn").addEventListener("click", () => {
      deactivateElementSelection();
      showMainPanel();
    });

    showIndicator();
  }

  function showCapturingIndicator() {
    const { wrapper } = getOrCreateHost();

    setWrapperContent(wrapper, `
      <div class="capsule-container capturing-capsule">
        <div class="spinner"></div>
        <span class="capsule-label">Capturing Figma design...</span>
      </div>
    `);
    showIndicator();
  }

  function showSuccessIndicator(label = "Copied to clipboard") {
    const { shadowRoot, wrapper } = getOrCreateHost();
    
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const keyName = isMac ? "⌘V" : "Ctrl+V";
    
    let displayLabel = label;
    if (label === "Copied to clipboard") {
      displayLabel = `Copied! Press ${keyName} to paste in Figma`;
    }
    
    setWrapperContent(wrapper, `
      <div class="capsule-container success-capsule">
        <div class="capsule-left-group">
          <!-- check circle icon (22:144) -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="display:block; flex-shrink:0;">
            <path d="M16 5.07193C17.2067 5.76862 18.2104 6.76837 18.9119 7.9722C19.6134 9.17604 19.9884 10.5422 19.9996 11.9355C20.0109 13.3288 19.658 14.7008 18.9761 15.9158C18.2941 17.1308 17.3066 18.1467 16.1114 18.8628C14.9162 19.5788 13.5547 19.9704 12.1617 19.9986C10.7686 20.0268 9.39238 19.6906 8.16917 19.0235C6.94596 18.3563 5.9182 17.3813 5.18763 16.1949C4.45705 15.0085 4.04901 13.6518 4.00388 12.2592L3.99988 12L4.00388 11.7408C4.04868 10.3592 4.45072 9.01274 5.1708 7.83276C5.89089 6.65277 6.90444 5.6795 8.11264 5.00783C9.32085 4.33617 10.6825 3.98903 12.0648 4.00026C13.4471 4.0115 14.8029 4.38072 16 5.07193ZM14.9656 9.83439C14.8279 9.69664 14.6446 9.6139 14.4502 9.60167C14.2557 9.58945 14.0635 9.64858 13.9096 9.76799L13.8344 9.83439L11.2 12.468L10.1656 11.4344L10.0904 11.368C9.93642 11.2487 9.74425 11.1896 9.54987 11.2019C9.35549 11.2141 9.17227 11.2969 9.03455 11.4346C8.89683 11.5723 8.81408 11.7556 8.80182 11.9499C8.78956 12.1443 8.84862 12.3365 8.96794 12.4904L9.03434 12.5656L10.6344 14.1656L10.7096 14.232C10.8499 14.3409 11.0224 14.4 11.2 14.4C11.3775 14.4 11.5501 14.3409 11.6904 14.232L11.7656 14.1656L14.9656 10.9656L15.032 10.8904C15.1514 10.7365 15.2106 10.5443 15.1983 10.3498C15.1861 10.1554 15.1034 9.97214 14.9656 9.83439Z" fill="#D4FC5D"/>
          </svg>
          <span class="capsule-label">${displayLabel}</span>
        </div>
        <button class="close-btn" id="figmaSuccessClose" type="button" title="Close">
          <svg width="12" height="12" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
            <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `);

    shadowRoot.querySelector("#figmaSuccessClose").addEventListener("click", () => {
      removeExisting();
    });

    showIndicator();
    
    setTimeout(() => {
      const currentHost = document.getElementById(HOST_ID);
      if (currentHost && shadowRoot.querySelector(".success-capsule")) {
        removeExisting();
      }
    }, 20000);
  }

  function showErrorIndicator() {
    const { shadowRoot, wrapper } = getOrCreateHost();
    
    setWrapperContent(wrapper, `
      <div class="capsule-container error-capsule">
        <div class="capsule-left-group">
          <!-- error icon -->
          <svg class="icon-error" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:block; flex-shrink:0;">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span class="capsule-label">Capture failed!</span>
        </div>
        <button class="close-btn" id="figmaErrorClose" type="button" title="Close">
            <svg width="12" height="12" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
      </div>
    `);

    shadowRoot.querySelector("#figmaErrorClose").addEventListener("click", () => {
      showMainPanel();
    });

    showIndicator();
    
    setTimeout(() => {
      const currentHost = document.getElementById(HOST_ID);
      if (currentHost && shadowRoot.querySelector(".error-capsule")) {
        showMainPanel();
      }
    }, 20000);
  }

  function showIndicator(isInitial = false) {
    const host = document.getElementById(HOST_ID);
    if (!host) return;
    host.style.display = "block";
    const wrapper = host.shadowRoot.querySelector(".wrapper-outer");
    if (wrapper) {
      if (isInitial) {
        wrapper.style.opacity = "0";
        wrapper.style.transform = "translateY(-20px) scale(0.95)";
        wrapper.offsetHeight; // force reflow
      }
      wrapper.style.opacity = "1";
      wrapper.style.transform = "translateY(0) scale(1)";
    }
  }

  function hideIndicator() {
    const host = document.getElementById(HOST_ID);
    if (host) {
      const wrapper = host.shadowRoot.querySelector(".wrapper-outer");
      if (wrapper) {
        wrapper.style.opacity = "0";
        wrapper.style.transform = "translateY(-20px)";
      }
      setTimeout(() => {
        host.style.display = "none";
      }, 200);
    }
  }

  function highlightElement(el) {
    let highlight = document.getElementById(HIGHLIGHT_ID);
    if (!highlight) {
      highlight = document.createElement("div");
      highlight.id = HIGHLIGHT_ID;
      highlight.setAttribute("data-figma-capture-ignore", "1");
      highlight.setAttribute("data-h2d-ignore", "true");
      document.documentElement.appendChild(highlight);
    }
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    highlight.style.top = `${rect.top + scrollTop}px`;
    highlight.style.left = `${rect.left + scrollLeft}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.style.display = "block";
  }

  function removeHighlight() {
    const highlight = document.getElementById(HIGHLIGHT_ID);
    if (highlight) {
      highlight.style.display = "none";
    }
  }

  function handleMouseOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    if (e.composedPath().some(el => el.id === HOST_ID) || target.closest(`#${HIGHLIGHT_ID}`)) return;
    highlightElement(target);
  }

  function handleMouseOut(e) {
    e.preventDefault();
    e.stopPropagation();
    removeHighlight();
  }

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    if (e.composedPath().some(el => el.id === HOST_ID) || target.closest(`#${HIGHLIGHT_ID}`)) return;

    deactivateElementSelection();
    hideIndicator();

    const tempId = "temp-" + Date.now();
    target.setAttribute("data-figma-temp-selector", tempId);

    chrome.runtime.sendMessage({
      type: "FIGMA_RUN_ELEMENT_CAPTURE",
      selector: `[data-figma-temp-selector="${tempId}"]`
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      deactivateElementSelection();
      showMainPanel();
    }
  }

  function activateElementSelection() {
    isSelectionModeActive = true;
    window.addEventListener("mouseover", handleMouseOver, true);
    window.addEventListener("mouseout", handleMouseOut, true);
    window.addEventListener("click", handleClick, true);
    window.addEventListener("keydown", handleKeyDown, true);
  }

  function deactivateElementSelection() {
    isSelectionModeActive = false;
    window.removeEventListener("mouseover", handleMouseOver, true);
    window.removeEventListener("mouseout", handleMouseOut, true);
    window.removeEventListener("click", handleClick, true);
    window.removeEventListener("keydown", handleKeyDown, true);
    removeHighlight();
  }

  // Set up listeners for message pings/commands from background script
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === "FIGMA_CAPTURE_STATE") {
      if (msg.state === "capturing") {
        showCapturingIndicator();
      } else if (msg.state === "success") {
        showSuccessIndicator(msg.delivery === "download" ? "Saved as file" : "Copied to clipboard");
      } else if (msg.state === "error") {
        showErrorIndicator();
      }
      return true;
    }
  });

  const wasActive = !!document.getElementById(HOST_ID);
  removeExisting();
  if (!wasActive) {
    injectGoogleFonts();
    showMainPanel(true);
  }
})();
