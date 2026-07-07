<p align="center">
  <img src="src/logo/icon128.png" width="128" height="128" alt="Web to Design Plus Logo" style="border-radius: 20%;" />
</p>

<h1 align="center">Web to Design Plus</h1>

<p align="center">
  <strong>一键抓取网页并转换为 Figma 可编辑设计稿</strong><br>
  在任意网页快速捕获页面或指定元素，完美还原 DOM 节点、样式及布局，提供极速无缝的设计还原体验。
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

## 功能特点

- **高颜值悬浮工具栏**：采用毛玻璃（Glassmorphism）磨砂质感与动效设计，支持网页内自由拖拽移动。
- **双重抓取模式**：
  - **整页抓取（Entire Screen）**：一键捕获整个网页的布局与全部节点。
  - **元素选择抓取（Select Element）**：支持在网页上直接高亮并选择任意 DOM 元素，实现局部局部抓取。
- **免下载极速体验**：抓取生成的数据自动以 Figma 识别的 `text/html` base64 编码写入剪贴板，**无需下载/导入任何 JSON 文件**，在 Figma 软件中直接使用 `Ctrl+V` (或 `Cmd+V`) 粘贴即可完美还原为可编辑的设计稿图层。
- **跨域图片代理与并发控制**：支持通过 Service Worker 进行跨域图片资源解析，可自定义配置采集并发数（可选 `4/6/8/10/12/16/20/无限`），有效避免网页图片因 CORS 限制而丢失。

## 后续规划 (Roadmap)

在接下来的版本中，我们计划陆续开发并补充以下功能：
1. **SVG 素材单独抓取 (Grab SVG)**：独立提取并单独复制网页中的 SVG 矢量路径与图标资产。
2. **字体与排版规范提取 (What's the Font)**：智能识别网页所使用的特殊 Web 字体，并导出排版样式指南。
3. **Web 设计系统规范生成**：支持根据目标网页的配色、阴影和间距，自动在 Figma 中生成对应的设计规范样式/变量。



## 核心抓取运行环境 (Core Runtime)

- **`capture.js` 来源**：该脚本来源于 Figma 官方服务：[mcp.figma.com/mcp/html-to-design/capture.js](https://mcp.figma.com/mcp/html-to-design/capture.js)，是进行 HTML 节点转换的核心引擎。
- **关于代码混淆的提示**：
  > [!IMPORTANT]
  > `capture.js` 是核心抓取运行时（Core capture runtime）。**如需对代码进行混淆，请仅在发布包（release copy）上进行，切勿直接在源码目录（`src/`）下的文件上操作**，以确保核心抓取引擎的可读性与未来的官方更新兼容性。

## 免责声明

- 本项目仅供学习、研究以及提升生产力使用。
- 使用本工具时，您需自行负责遵守目标网站的服务条款、版权规则、隐私法律及当地法律法规。
- 请勿将本工具用于抓取或分发未经授权、敏感或非法的网页内容。
- 作者及贡献者不对因滥用、数据丢失或任何直接/间接损害而导致的后果承担任何责任。

## 致谢 (Acknowledgements)

特别感谢 [派大鑫](https://github.com/Paidax01) 及其开源的原项目 [web-to-figma](https://github.com/Paidax01/web-to-figma)。本项目在此优秀项目的基础与灵感启发上进行了重构与体验优化，非常感谢原作者对开源社区做出的杰出贡献！

## 开源协议

本项目采用 [MIT 许可证](./LICENSE) 开源。

## GitHub Star 变化

<p align="center">
  <a href="https://star-history.com/#amasun/web-to-design-plus&Date">
    <img src="https://api.star-history.com/svg?repos=amasun/web-to-design-plus&type=Date" alt="Star History Chart" />
  </a>
</p>
