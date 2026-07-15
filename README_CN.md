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
  <a href="README.md">English</a> | 简体中文
</p>

## 🚀 功能特点

- **极简悬浮工具栏**：采用毛玻璃质感与动效设计，支持网页内自由拖拽，交互丝滑。
- **双重抓取模式**：支持“整页抓取（Entire Screen）”与“特定元素选择抓取（Select Element）”。
- **SVG 究极矢量还原 (Global SVG Sanitizer & Grabber)**：独创预处理机制，在抓取前瞬间将网页中极难解析的复杂矢量图标强制转化为标准内联 SVG，全面支持以下 **5 种 SVG 抓取模式**：
  1. **标准内联 SVG (`<svg>`)**：原生完美提取。
  2. **雪碧图引用 (`<use href="...">`)**：自动解析并展开内部与外部的 Symbol 引用。
  3. **背景与图片 (`<img>` / `background-image`)**：自动下载 `.svg` 源文件并无痕置换。
  4. **CSS 遮罩图标 (`mask-image`)**：提取遮罩源文件，自动将原元素的背景色作为 `fill` 属性注入。
  5. **Icon Font 字体图标**：内置字体引擎探测 PUA 字符，跨域嗅探提取字体，在前端直接生成精确的 SVG Path。
- **全站字体深度探查 (Font Audit)**：鼠标悬停即刻透视任何文字的字体家族、字重、尺寸、行高、字距与颜色，并支持一键复制精确的 CSS 样式规则。内置全局 `Fonts List` 字体分布审计功能，并支持自动嗅探网页加载的字体文件，支持一键下载本地（woff2, woff, ttf）及无缝整合 Google Fonts 库查阅。
- **复制粘贴即用**：**无需下载/导入任何 JSON 配置文件**，数据直接写入剪贴板，在 Figma 中一键 `Ctrl/Cmd + V` 粘贴即刻还原为图层。
- **自动跨域代理**：内置 Service Worker 自动处理跨域图片解析，结合 8 并发限制，确保图片资源不丢失。

## 📦 使用方法

### 1. 安装插件
直接在 [GitHub Releases](https://github.com/amasun/web-to-design-plus/releases) 中下载最新版本的 `web-to-design-plus.zip` 并解压，打开 Chrome 浏览器进入 `chrome://extensions/`，开启右上角的 **“开发者模式”**，点击左上角的 **“加载已解压的扩展程序”**，选择解压出的文件夹即可。

### 2. 抓取与还原
1. 访问任意网页，点击 Chrome 插件栏中的 **Web to Design Plus** 唤出悬浮工具栏。
2. 点击 **Entire screen**（整页）或 **Select element**（悬停选择特定 DOM 元素）。
3. 提示 `Copied to clipboard` 后，直接在 Figma 中按 `Ctrl/Cmd + V` 粘贴，即刻还原为可编辑设计稿。

## 🗺️ 后续规划 (Roadmap)

在接下来的版本中，我们计划陆续开发并补充以下功能：
1. **React/Vue/Tailwind 代码组件导出**：支持将捕获的网页元素直接复制为结构化的 React (JSX) 或 Vue 组件代码，并将内联 CSS 样式自动转换为 Tailwind 类。
2. **资产压缩与元数据清洗**：自动将小图 (<100KB) 转换为 Base64 编码以绕过代理限制，并过滤非标准 SVG 标签 (如 sketch/Adobe 标签) 以减小剪贴板大小。
3. **快捷键与热键支持**：支持全局自定义快捷键（如 `Alt+Shift+D`）唤起/隐藏工具栏，并在面板激活时支持单键触发（如 `A` / `E` / `S`）。

## ⚠️ 已知问题 (Known Issues)

目前项目的 `SVG 抓取` 及部分高级特性在极少数复杂场景下仍在持续优化中，这将在后续更新中逐步完善：
1. **Iframe 与深层提取**：在跨域或拥有严格安全策略的 iframe 场景下，可能会遇到 DOM 穿透限制。
2. **Icon Font 矢量化**：在网络极差，或目标网站使用了重度混淆/严格跨域限制的字体文件时，部分图标可能无法完美反解为 Path。未来版本将引入更具弹性的降级渲染策略。



## ⚙️ 核心抓取运行环境 (Core Runtime)

- **`capture.js` 来源**：该脚本来源于 Figma 官方服务：[mcp.figma.com/mcp/html-to-design/capture.js](https://mcp.figma.com/mcp/html-to-design/capture.js)，是进行 HTML 节点转换的核心引擎。
- **关于代码混淆的提示**：
  > [!IMPORTANT]
  > `capture.js` 是核心抓取运行时（Core capture runtime）。**如需对代码进行混淆，请仅在发布包（release copy）上进行，切勿直接在源码目录（`src/`）下的文件上操作**，以确保核心抓取引擎的可读性与未来的官方更新兼容性。

## ⚠️ 免责声明

- 本项目仅供学习、研究以及提升生产力使用。
- 使用本工具时，您需自行负责遵守目标网站的服务条款、版权规则、隐私法律及当地法律法规。
- 请勿将本工具用于抓取或分发未经授权、敏感或非法的网页内容。
- 作者及贡献者不对因滥用、数据丢失或任何直接/间接损害而导致的后果承担任何责任。

## 💖 致谢 (Acknowledgements)

特别感谢 [派大鑫](https://github.com/Paidax01) 及其开源的原项目 [web-to-figma](https://github.com/Paidax01/web-to-figma)。本项目在此优秀项目的基础与灵感启发上进行了重构与体验优化，非常感谢原作者对开源社区做出的杰出贡献！

## 📄 开源协议

本项目采用 [MIT 许可证](./LICENSE) 开源。

## 📈 GitHub Star 变化

<p align="center">
  <a href="https://star-history.com/#amasun/web-to-design-plus&Date">
    <img src="https://api.star-history.com/svg?repos=amasun/web-to-design-plus&type=Date" alt="Star History Chart" />
  </a>
</p>
