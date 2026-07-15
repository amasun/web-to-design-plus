window.figmaRunSVGSanitizer = async () => {
  const cleanups = [];

  try {
    console.log("[SVG Sanitizer] Starting phase 1...");

    // 1. Resolve <use> tags (internal and external sprites)
    const useTags = Array.from(document.querySelectorAll("use"));
    for (const use of useTags) {
      const href = use.getAttribute("href") || use.getAttribute("xlink:href");
      if (!href) continue;

      try {
        const svgParent = use.closest("svg");
        if (!svgParent) continue;

        let symbolHtml = null;
        let viewBox = null;

        if (href.startsWith("#")) {
          // Internal reference
          const targetId = href.substring(1);
          const target = document.getElementById(targetId);
          if (target && (target.tagName.toLowerCase() === "symbol" || target.tagName.toLowerCase() === "g")) {
            symbolHtml = target.innerHTML;
            if (target.hasAttribute("viewBox")) {
              viewBox = target.getAttribute("viewBox");
            }
          }
        } else if (href.includes(".svg")) {
          // External reference
          const [url, id] = href.split("#");
          try {
            const res = await fetch(url);
            if (res.ok) {
              const text = await res.text();
              const parser = new DOMParser();
              const doc = parser.parseFromString(text, "image/svg+xml");
              const target = doc.getElementById(id);
              if (target) {
                symbolHtml = target.innerHTML;
                if (target.hasAttribute("viewBox")) {
                  viewBox = target.getAttribute("viewBox");
                }
              } else if (!id) {
                // If no id, just take the whole SVG
                const rootSvg = doc.querySelector("svg");
                if (rootSvg) symbolHtml = rootSvg.innerHTML;
              }
            }
          } catch (e) {
            console.warn("[SVG Sanitizer] Failed to fetch external sprite:", href, e);
          }
        }

        if (symbolHtml) {
          const originalHtml = svgParent.innerHTML;
          const originalViewBox = svgParent.getAttribute("viewBox");
          
          cleanups.push(() => {
            svgParent.innerHTML = originalHtml;
            if (originalViewBox !== null) {
              svgParent.setAttribute("viewBox", originalViewBox);
            } else {
              svgParent.removeAttribute("viewBox");
            }
          });

          // Replace the <use> tag with the actual symbol contents
          const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
          wrapper.innerHTML = symbolHtml;
          
          // Apply use attributes (x, y, width, height, fill) to the wrapper
          Array.from(use.attributes).forEach(attr => {
            if (attr.name !== "href" && attr.name !== "xlink:href" && attr.name !== "class") {
              wrapper.setAttribute(attr.name, attr.value);
            }
          });

          use.replaceWith(wrapper);

          // If the symbol had a viewBox and the parent SVG doesn't, apply it
          if (viewBox && !svgParent.hasAttribute("viewBox")) {
            svgParent.setAttribute("viewBox", viewBox);
          }
        }
      } catch (err) {
        console.error("[SVG Sanitizer] Error resolving <use>", href, err);
      }
    }

    // 2. Resolve background-image and mask-image containing SVG
    // To avoid performance issues, we query common tag names that might be used as icons, or all elements if fast enough.
    // For safety, we can just iterate over all elements.
    const allElements = document.body.querySelectorAll("*");
    
    // Helper to process an element or its pseudo-element
    const processElementBg = async (el, pseudo = null) => {
      const style = window.getComputedStyle(el, pseudo);
      const bgImage = style.getPropertyValue("background-image");
      const maskImage = style.getPropertyValue("mask-image") || style.getPropertyValue("-webkit-mask-image");
      
      let targetUrl = null;
      let isMask = false;

      if (bgImage && bgImage.includes('url("') && bgImage.includes(".svg")) {
        const match = bgImage.match(/url\("([^"]+)"\)/);
        if (match) targetUrl = match[1];
      } else if (bgImage && bgImage.includes("url('") && bgImage.includes(".svg")) {
        const match = bgImage.match(/url\('([^']+)'\)/);
        if (match) targetUrl = match[1];
      } else if (bgImage && bgImage.includes("url(") && bgImage.includes(".svg")) {
        const match = bgImage.match(/url\(([^'"]+)\)/);
        if (match) targetUrl = match[1];
      }

      if (!targetUrl && maskImage && maskImage.includes("url(") && maskImage.includes(".svg")) {
        const match = maskImage.match(/url\("?([^"]+)"?\)/) || maskImage.match(/url\('?([^']+)'?\)/) || maskImage.match(/url\(([^'"]+)\)/);
        if (match) {
          targetUrl = match[1];
          isMask = true;
        }
      }

      if (targetUrl && !targetUrl.startsWith("data:")) {
        try {
          const res = await fetch(targetUrl);
          if (res.ok) {
            let svgText = await res.text();
            
            // If it's a mask, we need to apply the element's background color as the SVG fill
            if (isMask) {
              const bgColor = style.getPropertyValue("background-color");
              if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
                 // Inject fill into the SVG
                 svgText = svgText.replace(/<svg([^>]*)>/, `<svg$1 fill="${bgColor}">`);
                 // Strip existing fills to allow the new one to take precedence
                 svgText = svgText.replace(/fill="[^"]*"/g, ""); 
                 svgText = svgText.replace(/<svg([^>]*)>/, `<svg$1 fill="${bgColor}">`);
              }
            }

            const wrapper = document.createElement("div");
            wrapper.innerHTML = svgText;
            const svgNode = wrapper.querySelector("svg");
            
            if (svgNode) {
              // Position the SVG exactly over the original element
              const rect = el.getBoundingClientRect();
              
              // We inject it into the DOM directly over the element
              const overlay = document.createElement("div");
              overlay.style.position = "absolute";
              overlay.style.left = `${rect.left + window.scrollX}px`;
              overlay.style.top = `${rect.top + window.scrollY}px`;
              overlay.style.width = `${rect.width}px`;
              overlay.style.height = `${rect.height}px`;
              overlay.style.pointerEvents = "none";
              overlay.style.zIndex = "999999";
              overlay.style.display = "flex";
              overlay.style.alignItems = "center";
              overlay.style.justifyContent = "center";
              
              svgNode.style.width = "100%";
              svgNode.style.height = "100%";
              
              overlay.appendChild(svgNode);
              document.body.appendChild(overlay);

              // Hide the original background or mask
              const originalBg = el.style.backgroundImage;
              const originalMask = el.style.maskImage || el.style.webkitMaskImage;
              
              if (isMask) {
                el.style.setProperty("-webkit-mask-image", "none", "important");
                el.style.setProperty("mask-image", "none", "important");
              } else {
                el.style.setProperty("background-image", "none", "important");
              }

              cleanups.push(() => {
                overlay.remove();
                if (isMask) {
                  el.style.webkitMaskImage = originalMask;
                  el.style.maskImage = originalMask;
                } else {
                  el.style.backgroundImage = originalBg;
                }
              });
            }
          }
        } catch (e) {
          console.warn("[SVG Sanitizer] Failed to fetch bg/mask SVG:", targetUrl, e);
        }
      }
    };

    // To prevent blocking the main thread for too long, we batch the fetch requests
    const bgPromises = [];
    for (const el of allElements) {
      // Skip script, style, and svg internals
      if (["script", "style", "svg", "path", "g", "symbol", "use", "defs"].includes(el.tagName.toLowerCase())) continue;
      
      // If it's just an <img> tag with a .svg src
      if (el.tagName.toLowerCase() === "img") {
        const src = el.getAttribute("src");
        if (src && src.toLowerCase().endsWith(".svg") && !src.startsWith("data:")) {
          bgPromises.push(
            fetch(src).then(res => res.text()).then(svgText => {
              const wrapper = document.createElement("div");
              wrapper.innerHTML = svgText;
              const svgNode = wrapper.querySelector("svg");
              if (svgNode) {
                const rect = el.getBoundingClientRect();
                const overlay = document.createElement("div");
                overlay.style.position = "absolute";
                overlay.style.left = `${rect.left + window.scrollX}px`;
                overlay.style.top = `${rect.top + window.scrollY}px`;
                overlay.style.width = `${rect.width}px`;
                overlay.style.height = `${rect.height}px`;
                overlay.style.pointerEvents = "none";
                overlay.style.zIndex = "999999";
                
                svgNode.style.width = "100%";
                svgNode.style.height = "100%";
                
                overlay.appendChild(svgNode);
                document.body.appendChild(overlay);

                const originalOpacity = el.style.opacity;
                el.style.opacity = "0";

                cleanups.push(() => {
                  overlay.remove();
                  el.style.opacity = originalOpacity;
                });
              }
            }).catch(e => console.warn("[SVG Sanitizer] Failed to fetch img SVG:", src, e))
          );
        }
      }

      bgPromises.push(processElementBg(el));
      // We can also check ::before and ::after, but let's stick to the element itself for now to save time
    }

    await Promise.allSettled(bgPromises);

    console.log(`[SVG Sanitizer] Phase 1 complete. Registered ${cleanups.length} cleanups.`);

  } catch (err) {
    console.error("[SVG Sanitizer] Unhandled error:", err);
  }

  // Return a cleanup function that restores everything
  return () => {
    console.log(`[SVG Sanitizer] Reverting ${cleanups.length} DOM changes...`);
    // Run in reverse order
    for (let i = cleanups.length - 1; i >= 0; i--) {
      try {
        cleanups[i]();
      } catch (e) {
        console.error("[SVG Sanitizer] Cleanup error:", e);
      }
    }
  };
};
