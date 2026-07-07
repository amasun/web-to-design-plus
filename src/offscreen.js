chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "FIGMA_OFFSCREEN_COPY") return;
  const text = msg.text || "";
  navigator.clipboard.writeText(text).then(() => {
    sendResponse({ ok: true });
  }).catch((err) => {
    // Retry once on transient failure.
    navigator.clipboard.writeText(text).then(() => {
      sendResponse({ ok: true });
    }).catch((err2) => {
      sendResponse({ ok: false, error: String(err2) });
    });
  });
  return true;
});
