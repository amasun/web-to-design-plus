# TODO Roadmap - Web to Design Plus

This file tracks proposed feature enhancements and optimizations for future versions of the extension.

## 🚀 Feature Enhancements
- [ ] **React/Vue/Tailwind Code Export**
  *   Add quick actions/buttons to card actions to copy SVGs directly as React (JSX) or Vue component formats.
  *   Convert inline CSS/SVG style attributes to Tailwind classes.
- [ ] **Captured Fonts List & Detection**
  *   Analyze font family declarations in [capture.js](file:///x:/XCoding/web-to-design-plus/src/capture.js) and report used custom web fonts.
  *   Show font warnings and provide Google Fonts installer links on capture success.

## ⚡ Performance & Reliability
- [ ] **Base64 Image Capturing & Compression**
  *   Auto-encode images (<100KB) to Base64 in DOM converter to guarantee rendering and bypass proxy timeouts when pasting into Figma.
- [ ] **Clean Metadata & Descriptors**
  *   Filter and strip out non-standard attributes (e.g. `sketch:type`, `<desc>`, Adobe generator tags) from copied SVGs to minimize clipboard size.

## 🛠️ Keyboard shortcuts & UI Flow
- [ ] **Global Hotkeys & Quick Access**
  *   Support custom shortcuts (`Alt+Shift+D`) to toggle the extension toolbar.
  *   Add single-key navigation trigger actions (`A` - Entire Screen, `E` - Element Capture, `S` - SVG Grabber) inside panel focus state.
