# Web to Design Plus - Chrome Web Store Listing

这个文档包含了您在发布插件到 Chrome 网上应用店时，需要填写的全部文本信息。由于应用店面向全球用户，建议同时提供中文（zh-CN）和英文（en）两个版本的描述。

---

## 中文版 (Chinese - zh-CN)

### 1. 插件名称 (Name)
**字符限制**: 最多 45 个字符
```text
Web to Design Plus - 一键抓取网页到 Figma
```

### 2. 简短描述 (Short Description)
**字符限制**: 最多 132 个字符。这是展示在搜索结果和插件卡片上的重要信息。
```text
设计师和开发者的终极网页抓取利器。一键将任意网页完美转换为可编辑的 Figma 设计稿，并提供强大的 SVG 提取和全站字体分析与下载功能。
```

### 3. 详细描述 (Detailed Description)
**字符限制**: 无严格限制，支持基础格式。
```text
Web to Design Plus 是专为 UI/UX 设计师、前端开发者和产品经理打造的浏览器扩展。它能将您看到的任何网页，快速转化为设计软件中所需的生产力资产。

核心功能：

1. 一键整页转 Figma (Capture Entire Page)
- 无缝抓取当前网页的真实 DOM 结构。
- 将 HTML/CSS 布局自动映射为原生的 Figma 图层与 Auto Layout（自动布局）。
- 直接基于现有网页进行重构，告别手动临摹。

2. 精准区域抓取 (Capture Selection)
- 按需框选网页中的特定元素、组件或区块进行精准提取。
- 过滤无关干扰，仅将目标模块转换为高质量的 Figma 资产。

3. 全站字体探查 (Font Inspector & Audit)
- 鼠标悬停即刻查看网页中任何文字的字体家族（Font Family）、字重、行高、字距与颜色。
- 一键生成并复制 CSS 样式代码。
- 全站字体审计：扫描并统计当前网页所有的字体使用频率。
- 字体极速下载：嗅探网页加载的字体文件，支持一键下载至本地（woff2, ttf 等）。

4. SVG 矢量还原 (Global SVG Sanitizer)
- 独创网页预处理机制，在抓取前将复杂图标强制转化为标准 SVG 矢量节点。
- 支持 5 种高级提取模式：标准内联 SVG、雪碧图 (<use>)、图片/背景图、CSS 遮罩 (mask-image)，并内置引擎直接转换 Icon Font（如 FontAwesome）为矢量路径。

隐私与安全：
坚持「本地优先」原则。所有抓取动作和数据解析均在您当前的浏览器本地完成。不收集、不存储、不上传您的任何网页浏览数据，请放心使用。

开源与支持：
欢迎访问我们的 GitHub 仓库查看源码或提交反馈：
https://github.com/amasun/web-to-design-plus
```

### 4. 搜索关键字 (Search Keywords)
*注：用逗号分隔，帮助用户在搜索时找到你的插件。*
```text
Figma, Web to Figma, HTML to Figma, Font inspector, SVG grabber, UI design, 网页设计, 字体下载, 网页抓取, 开发者工具
```

### 5. v1.1 更新说明 (Release Notes)
```text
【v1.1 更新内容】
1. 字体跨域下载修复：新增后台代理下载机制，彻底解决 Google Fonts 等第三方字体无法下载及弹出重复窗口的问题。
2. 全局 ESC 快捷退出：支持使用 ESC (Escape) 键随时随时一键退出字体探查面板与元素选择模式，快速恢复页面原状。
```

---

## 英文版 (English - en)

### 1. Name
```text
Web to Design Plus - Web to Figma & Assets
```

### 2. Short Description
```text
The ultimate tool for designers & developers. Convert any website into an editable Figma design, extract SVGs, and inspect/download fonts.
```

### 3. Detailed Description
```text
Web to Design Plus is a browser extension built for UI/UX designers, front-end developers, and product managers. It transforms any webpage you see into editable design assets instantly.

Key Features:

1. Capture Entire Page (Web to Figma)
- Seamlessly capture the real DOM structure of any webpage.
- Automatically map complex HTML/CSS layouts into native Figma layers and Auto Layout properties.
- Start redesigning directly from live products.

2. Capture Selection
- Selectively highlight and capture specific elements, components, or sections of a webpage.
- Filter out irrelevant noise and extract only the exact modules you want.

3. Font Inspector & Audit
- Hover over any text to reveal its Font Family, weight, size, line-height, letter-spacing, and color.
- Copy precise CSS typography rules with a single click.
- Fonts List (Audit): Scan the entire page to see a summarized list of all fonts used and their occurrence frequencies.
- Direct Font Download: Automatically sniff font files loaded by the webpage and download them locally (woff2, ttf).

4. Global SVG Sanitizer & Restoration
- Employs a pre-capture mutation engine to convert complex web icons into standard SVG nodes.
- Supports 5 advanced extraction modes: Standard Inline SVGs, Sprites (<use>), Images/Backgrounds, CSS Masks, and on-the-fly Icon Font (e.g., FontAwesome) vectorization into perfect paths.

Privacy & Security:
Built with a "Local First" philosophy. All parsing and extraction happen entirely within your local browser. We do NOT collect, store, or upload any of your browsing data or personal information. 

Open Source & Support:
Visit our GitHub repository for source code or feedback:
https://github.com/amasun/web-to-design-plus
```

### 4. Search Keywords
```text
Figma, Web to Figma, HTML to Figma, Font inspector, SVG grabber, UI design, typography, developer tools
```

### 5. Release Notes (v1.1)
```text
[v1.1 What's New]
1. Fixed Web Font Download: Added a background proxy downloader to solve cross-origin font downloads (e.g., Google Fonts) and fix duplicate save dialog issues.
2. Global ESC Shortcut Exit: Press ESC (Escape) anytime to instantly quit the font inspector panel or element selection mode.
```

---

## Chrome Web Store 隐私申报 (Privacy)

### Single Purpose Description
```text
This extension captures the current webpage's DOM structure and assets (SVGs, fonts) and converts them into editable design files for use in Figma. All functionality is scoped to on-demand, user-initiated actions on the current active tab.
```

### Permission Justifications

**activeTab**
```text
Required to access the content of the current tab only when the user explicitly clicks the extension action button. The extension reads DOM structure and asset URLs to perform the capture. No background tab access is performed.
```

**scripting**
```text
Required to inject content scripts (capture.js, inpage-toolbar.js, svg-grabber.js, font-inspector.js) into the active tab upon user request. These scripts read DOM structure, compute styles, and extract assets for conversion to Figma format.
```

**storage**
```text
Used to persist user preferences (e.g., last selected capture mode) locally in the browser. No personal data or browsing history is stored. All data remains on the user's device.
```

**clipboardWrite**
```text
Used to copy CSS typography values (font family, size, weight, line-height, color) to the clipboard when the user clicks the "Copy CSS" button in the Font Inspector panel. This is a direct, user-initiated action.
```

**clipboardRead**
```text
Required as a paired permission with clipboardWrite to ensure reliable clipboard operations across different browser security contexts during the copy action.
```

**offscreen**
```text
Used to create an offscreen document that runs the opentype.js library to parse font binary files (woff2, ttf) entirely within the browser, converting Icon Font glyphs into SVG path data. No data leaves the device.
```

**downloads**
```text
Required to allow users to save extracted web font files (e.g., woff2, ttf) directly to their local machine upon clicking the download button in the Font Inspector panel. Used solely for user-initiated asset downloads.
```

**debugger**
```text
Used solely to temporarily apply Emulation.setDeviceMetricsOverride via the Chrome DevTools Protocol to capture full-page screenshots at the correct pixel ratio. The debugger is attached only during the capture operation and immediately detached upon completion. It is not used to inspect, intercept, or monitor any network traffic or user data.
```

**Host Permission Justification**
```text
The extension operates on the currently active tab when explicitly triggered by the user. Host permissions are required to inject content scripts into arbitrary user-visited pages, as the extension is designed to work on any website the user chooses to capture. No data from visited pages is stored or transmitted externally.
```

### Remote Code
**选择: No, I am not using remote code**

所有 JS 逻辑（包括 opentype.js 库）均已在打包时本地内置到扩展包中，不从任何外部 URL 动态加载代码。

### Data Usage
**所有选项均不勾选（不收集任何用户数据）**

勾选以下三条声明（必须全部勾选）：
- I do not sell or transfer user data to third parties
- I do not use or transfer user data for purposes unrelated to the extension's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

### Privacy Policy URL
如果 Chrome 要求填写，可以直接使用 GitHub 仓库的 README 链接：
```text
https://github.com/amasun/web-to-design-plus#readme
```
或者在 GitHub 上新建一个 `PRIVACY.md` 文件，链接填：
```text
https://github.com/amasun/web-to-design-plus/blob/master/PRIVACY.md
```
