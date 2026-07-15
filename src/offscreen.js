chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "FIGMA_OFFSCREEN_COPY") return;

  (async () => {
    try {
      const jsonStr = msg.json || msg.text || "";

      // Figma's paste handler requires text/html with a specific marker format:
      //   <span data-h2d="<!--(figh2d)BASE64(/figh2d)-->"></span>
      // where BASE64 is the UTF-8 JSON encoded as a base64 data URL.
      const bytes = new TextEncoder().encode(jsonStr);
      const base64 = btoa(String.fromCharCode(...bytes));
      const html = `<span data-h2d="<!--(figh2d)${base64}(/figh2d)-->"></span>`;
      const htmlBlob = new Blob([html], { type: "text/html" });

      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": htmlBlob })
      ]);
      sendResponse({ ok: true });
    } catch (err) {
      // Fallback: try plain text as last resort
      try {
        await navigator.clipboard.writeText(msg.json || msg.text || "");
        sendResponse({ ok: true });
      } catch (err2) {
        sendResponse({ ok: false, error: String(err2) });
      }
    }
  })();

  return true; // keep the message channel open for async sendResponse
});
