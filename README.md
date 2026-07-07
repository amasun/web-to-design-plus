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

- **内嵌工具栏**：网页内嵌浮动工具栏，支持一键触发抓取。
- **跨域图片代理**：支持开启跨域图片代理模式，有效减少因跨域导致的图片丢失。
- **并发控制**：可配置图片代理采集并发数（可选 `4/6/8/10/12/16/20/无限`）。
- **一键导出**：抓取完成后自动将结果导出为 `.json` 数据文件。

## 后续规划 (Roadmap)

在接下来的版本中，我们计划陆续开发并补充以下功能：
1. **元素选择抓取**：支持用户在页面上自由选择指定元素，然后再执行局部抓取和复制。
2. **SVG 素材单独抓取**：提供对网页中 SVG 图标与素材的独立提取和导出功能。
3. **Web 设计规范生成**：支持根据网页自动分析并生成对应的 Figma 设计系统规范。
4. **字体与字体规范提取**：支持单独提取网页所使用的字体，并整理生成排版与字体规范。



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

## 开源协议

本项目采用 [MIT 许可证](./LICENSE) 开源。

## GitHub Star 变化

<p align="center">
  <a href="https://star-history.com/#amasun/web-to-design-plus&Date">
    <img src="https://api.star-history.com/svg?repos=amasun/web-to-design-plus&type=Date" alt="Star History Chart" />
  </a>
</p>
