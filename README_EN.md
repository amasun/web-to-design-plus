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

- **In-page Floating Toolbar**: Quick access to trigger capture directly from the page.
- **Cross-origin Image Proxy**: Optional mode to fetch images through background proxy, reducing missing images due to CORS.
- **Concurrency Control**: Configurable image fetch concurrency (`4/6/8/10/12/16/20/infinite`).
- **One-click Export**: Automatically download capture results as `.json`.

## Future Roadmap

We plan to introduce the following features in upcoming updates:
1. **Interactive Element Selection**: Allow users to select specific elements on the page before triggering a local capture and copy.
2. **SVG Asset Capture**: Add a dedicated feature to capture and export SVG icons and graphics separately.
3. **Web-to-Design System Generation**: Automatically generate design guidelines and Figma components from webpage analysis.
4. **Font & Typography Extraction**: Extract custom fonts and generate cohesive typography guidelines.



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
