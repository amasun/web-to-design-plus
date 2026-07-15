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
- **Ultimate Vector Restoration (Global SVG Sanitizer & Grabber)**: Employs a pre-capture DOM mutation strategy to instantly convert complex vector icons into standard inline SVGs right before capture. Fully supports the following **5 SVG Capture Modes**:
  1. **Standard Inline SVG (`<svg>`)**: Perfect node and property extraction.
  2. **Sprite References (`<use href="...">`)**: Automatically resolves and expands internal/external Symbol references.
  3. **Images & Backgrounds (`<img>` / `background-image`)**: Fetches `.svg` sources and seamlessly overlays them.
  4. **CSS Mask Icons (`mask-image`)**: Extracts mask sources and intelligently injects the original element's background color as the `fill` property.
  5. **Icon Fonts**: Features a built-in `opentype.js` engine to probe PUA characters, sniff CSS for cross-origin font files, and generate precise SVG Paths entirely on the frontend.
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

## 🗺️ Future Roadmap

We plan to introduce the following features in upcoming updates:
1. **React/Vue/Tailwind Code Export**: Copy captured elements directly as structured React (JSX) or Vue component code, converting inline CSS styles into Tailwind utility classes.
2. **Asset Compression & Metadata Cleaning**: Automatically convert small images (<100KB) to Base64 to bypass proxy restrictions, and filter out sketch/Adobe tags to reduce clipboard size.
3. **Keyboard Shortcuts & Hotkeys**: Support customizable global shortcut (`Alt+Shift+D`) to toggle the toolbar, and single-key navigation triggers inside the panel (`A` / `E` / `S`).

## ⚠️ Known Issues

The `SVG Extraction` and certain advanced features are still being optimized for edge cases, which will be addressed in future updates:
1. **Iframe Deep Extraction**: Penetrating DOMs in cross-origin or highly secured iframe scenarios may occasionally fail. We are working on perfecting the cross-iframe communication mechanism.
2. **Icon Font Vectorization**: In cases of extremely poor network conditions, heavy CSS obfuscation, or strict CORS restrictions on fonts, some icons may fail to resolve into perfect paths. Upcoming versions will introduce more resilient fallback rendering strategies.



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
