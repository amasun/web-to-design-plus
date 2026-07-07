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

- **极简悬浮工具栏**：采用毛玻璃质感与动效设计，支持网页内自由拖拽，交互丝滑。
- **双重抓取模式**：支持“整页抓取（Entire Screen）”与“特定元素选择抓取（Select Element）”。
- **复制粘贴即用**：**无需下载/导入任何 JSON 配置文件**，数据直接写入剪贴板，在 Figma 中一键 `Ctrl/Cmd + V` 粘贴即刻还原为图层。
- **自动跨域代理**：内置 Service Worker 自动处理跨域图片解析，结合 8 并发限制，确保图片资源不丢失。

## 使用方法

### 1. 安装插件
*   **开箱即用（推荐）**：直接在 GitHub Releases 中下载 `web-to-design-plus.zip` 并解压，打开 Chrome 进入 `chrome://extensions/`，开启“开发者模式”，点击“加载已解压的扩展程序”导入解压后的文件夹即可。
*   **源码编译**：拉取源码后，在根目录依次执行以下命令：
    ```bash
    npm install
    npm run build
    ```
    然后将编译生成的 `dist/` 文件夹通过上述方式导入 Chrome 中。

### 2. 抓取与还原
1. 访问任意网页，点击 Chrome 插件栏中的 **Web to Design Plus** 唤出悬浮工具栏。
2. 点击 **Entire screen**（整页）或 **Select element**（悬停选择特定 DOM 元素）。
3. 提示 `Copied to clipboard` 后，直接在 Figma 中按 `Ctrl/Cmd + V` 粘贴，即刻还原为可编辑设计稿。

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
