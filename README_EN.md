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
  <a href="README.md">简体中文</a> | <a href="README_EN.md">English</a>
</p>


## Features

- **Beautiful Floating Toolbar**: Designed with premium Glassmorphism styling and smooth animations, supporting free dragging on any web page.
- **Dual Capture Modes**:
  - **Entire Screen**: Capture the full layout and all DOM elements in one click.
  - **Select Element**: Highlight and select specific elements interactively for local captures.
- **Zero-Download Workflow**: Captured page data is formatted into Figma's recognized `text/html` base64 structure and written directly to the clipboard. **No JSON downloads required** — simply press `Ctrl+V` (or `Cmd+V`) inside Figma to paste and edit layers immediately.
- **CORS Image Proxy & Concurrency**: Fetches cross-origin assets securely via background Service Workers, with configurable concurrency settings (`4/6/8/10/12/16/20/infinite`) to prevent image loss.

## Installation & Usage

### 1. Install the Extension
1. Download this repository's source code and extract it locally.
2. Open a terminal in the project root directory, and run the following commands to install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
3. Open Google Chrome and navigate to the extension management page: `chrome://extensions/`.
4. Enable **"Developer mode"** in the top-right corner.
5. Click **"Load unpacked"** in the top-left corner, and select the compiled `dist` directory.

### 2. Capture Web Pages
1. Visit any web page you wish to capture, click the **Web to Design Plus** icon in your Chrome extensions bar, and the floating toolbar will slide out in the top-right corner.
2. Select your capture mode:
   - Click **Entire screen**: Automatically scrolls and captures the full web page layout.
   - Click **Select element**: Hover and select any specific DOM element on the page, then click to capture.
3. Once completed, the toolbar will display a green `Copied to clipboard` indicator, meaning the Figma-ready data has been securely written to your clipboard.

### 3. Paste into Figma
1. Open the Figma client or web editor.
2. Create or open a design Draft.
3. Press `Ctrl + V` (`Cmd + V` on macOS) on the canvas to paste the layout.
4. Wait a few moments, and the web page will be reconstructed into clean, editable Figma layers!

## Future Roadmap

We plan to introduce the following features in upcoming updates:
1. **SVG Asset Capture (Grab SVG)**: Extract and copy SVG vectors/icons independently from the webpage.
2. **Font & Typography Guidelines (What's the Font)**: Identify web fonts used on the page and export typographical style guides.
3. **Web-to-Design System Generation**: Automatically generate typography, spacing, shadows, and color palette variables directly into Figma.



## Core Runtime

- **`capture.js` Source**: Sourced from Figma's official service: [mcp.figma.com/mcp/html-to-design/capture.js](https://mcp.figma.com/mcp/html-to-design/capture.js). This script is the core engine for HTML-to-design conversion.
- **Obfuscation Rule**:
  > [!IMPORTANT]
  > `capture.js` is the core capture runtime. **If you obfuscate code, do it on a release copy, not on source files (inside the `src/` directory)** to ensure readability and future compatibility with official upstream updates.

## Disclaimer

- This project is provided for learning, research, and productivity use only.
- You are responsible for complying with website terms, copyright rules, privacy laws, and applicable local regulations.
- Do not use this tool to capture or distribute unauthorized, sensitive, or illegal content.
- The authors and contributors are not liable for misuse, data loss, or any direct/indirect damages caused by this project.

## Acknowledgements

Special thanks to [Paidax01 (派大鑫)](https://github.com/Paidax01) for his original open-source project [web-to-figma](https://github.com/Paidax01/web-to-figma). This project was redesigned and optimized based on the core logic and inspiration of his excellent work. We truly appreciate the author's outstanding contribution to the open-source community!

## License

This project is open-sourced under the [MIT License](./LICENSE).

## GitHub Star History

<p align="center">
  <a href="https://star-history.com/#amasun/web-to-design-plus&Date">
    <img src="https://api.star-history.com/svg?repos=amasun/web-to-design-plus&type=Date" alt="Star History Chart" />
  </a>
</p>
