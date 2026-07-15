<p align="center">
  <img src="src/logo/icon128.png" width="128" height="128" alt="Web to Design Plus Logo" style="border-radius: 20%;" />
</p>

<h1 align="center">Web to Design Plus</h1>

<p align="center">
  <strong>One-click web page capture and conversion to editable Figma designs</strong><br>
  Quickly capture full pages or specific elements on any webpage, perfectly restoring DOM nodes, styles, and layouts for a seamless design recovery experience.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-MV3-black?style=flat-square" alt="Manifest" />
  <img src="https://img.shields.io/badge/Browser-Chrome-blue?style=flat-square" alt="Browser" />
  <img src="https://img.shields.io/badge/Language-JavaScript-orange?style=flat-square" alt="Language" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<p align="center">
  English | <a href="README_CN.md">简体中文</a>
</p>


## 🚀 Features

- **Minimal Floating Toolbar**: Premium glassmorphism design with smooth transition animations, draggable anywhere on the screen.
- **Dual Capture Modes**: Support full-page capture (Entire Screen) and interactive local element selection (Select Element).
- **Smart SVG Deep Extraction (Grab SVG)**: Recursively penetrates same-origin `iframes` and Shadow DOMs to capture vector assets; features a multi-layer semantic detection engine that intelligently infers accurate icon names from CSS classes (Lucide/FontAwesome), internal SVG tree IDs (`<mask id="...">`), and adjacent sibling text context.
- **Ultimate Font Inspector (Font Audit)**: Hover over any text to reveal its typography (Font Family, weight, size, line-height, letter-spacing, and color) and copy precise CSS rules. Includes a global `Fonts List` to audit page typography and supports automatic font file sniffing for one-click local downloads (woff2, woff, ttf) with Google Fonts integration.
- **Instant Copy & Paste**: **No JSON file downloads**. Data is directly formatted and written to your clipboard — paste with `Ctrl/Cmd + V` directly in Figma to generate editable layers.
- **Auto Image Proxy**: Automatically resolves CORS-restricted images via Service Worker background fetching with an 8-concurrency limit.

## 📦 Usage

### 1. Installation
Download the latest `web-to-design-plus.zip` from [GitHub Releases](https://github.com/amasun/web-to-design-plus/releases) and extract it. Open Google Chrome, go to `chrome://extensions/`, enable **"Developer mode"** in the top-right corner, click **"Load unpacked"** in the top-left, and select the extracted folder.

### 2. Capture & Restore
1. Open any webpage and click the **Web to Design Plus** extension icon to reveal the toolbar.
2. Select **Entire screen** or **Select element** (hover and click on your target DOM element).
3. Once the `Copied to clipboard` success indicator appears, press `Ctrl/Cmd + V` in Figma to paste and edit layers immediately.

## 🗺️ Future Roadmap (v1.1+)

We plan to introduce the following features in upcoming updates (v1.1 and beyond):
1. **True Icon Font to SVG Conversion**: Deep parsing of loaded web fonts (TTF/WOFF) to extract glyph vectors for icon fonts (like FontAwesome), allowing you to grab them as real SVGs. (See [v1.1 Plan](./docs/v1.1-icon-font-plan.md)).
2. **React/Vue/Tailwind Code Export**: Copy captured elements directly as structured React (JSX) or Vue component code, converting inline CSS styles into Tailwind utility classes.
3. **Asset Compression & Metadata Cleaning**: Automatically convert small images (<100KB) to Base64 to bypass proxy restrictions, and filter out sketch/Adobe tags to reduce clipboard size.
4. **Keyboard Shortcuts & Hotkeys**: Support customizable global shortcut (`Alt+Shift+D`) to toggle the toolbar, and single-key navigation triggers inside the panel (`A` / `E` / `S`).



## ⚙️ Core Runtime

- **`capture.js` Source**: Sourced from Figma's official service: [mcp.figma.com/mcp/html-to-design/capture.js](https://mcp.figma.com/mcp/html-to-design/capture.js). This script is the core engine for HTML-to-design conversion.
- **Obfuscation Rule**:
  > [!IMPORTANT]
  > `capture.js` is the core capture runtime. **If you obfuscate code, do it on a release copy, not on source files (inside the `src/` directory)** to ensure readability and future compatibility with official upstream updates.

## ⚠️ Disclaimer

- This project is provided for learning, research, and productivity use only.
- You are responsible for complying with website terms, copyright rules, privacy laws, and applicable local regulations.
- Do not use this tool to capture or distribute unauthorized, sensitive, or illegal content.
- The authors and contributors are not liable for misuse, data loss, or any direct/indirect damages caused by this project.

## 💖 Acknowledgements

Special thanks to [Paidax01 (派大鑫)](https://github.com/Paidax01) for his original open-source project [web-to-figma](https://github.com/Paidax01/web-to-figma). This project was redesigned and optimized based on the core logic and inspiration of his excellent work. We truly appreciate the author's outstanding contribution to the open-source community!

## 📄 License

This project is open-sourced under the [MIT License](./LICENSE).

## 📈 GitHub Star History

<p align="center">
  <a href="https://star-history.com/#amasun/web-to-design-plus&Date">
    <img src="https://api.star-history.com/svg?repos=amasun/web-to-design-plus&type=Date" alt="Star History Chart" />
  </a>
</p>
