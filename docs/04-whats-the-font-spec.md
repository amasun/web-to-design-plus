# 04 — What's the Font 排版检视规范 (Font Inspector Spec)

## 1. 功能概述

**What's the Font** 为设计师和前端工程师提供专业级网页排版检视与字体文件深度探测能力，精准掌握并提取页面文字的字族、排版规范与真实字体文件资源。

核心特性：
- **1:1 复刻 Figma Typography 属性面板布局**，零认知负担转化设计规范。
- **实时悬停侦测**：鼠标悬停任意文本即呈现高亮边框 + 信息气泡。
- **全页排版审计**：一键生成全页字体族清单。
- **网页字体源文件深度探测与下载**：嗅探 `.woff2 / .woff / .ttf` 真实资源地址并提供一键下载。

---

## 2. 触发入口

主工具栏第四个功能按钮：**What's the Font**（字体/排版侦测图标）。

点击后 `inpage-toolbar.js` 发送 `FIGMA_RUN_FONT_INSPECTOR` 消息至 `background.js`，background.js 注入 `font-inspector.js` 并调用 `window.figmaFontInspector.toggle()`。

---

## 3. 工作模式

### 模式 A：实时悬停排版检视 (Interactive Inspect Mode)

**悬停行为**：

- 鼠标移到任意文本节点时，该元素加上 `#D4FC5D` 色细边框高亮。
- 鼠标上方浮现**毛玻璃信息气泡（Font Pill）**，简要显示：
  ```
  Inter  •  SemiBold 600  •  16px
  ```

**点击锁定行为**：

- 点击目标文本 → 锁定该元素，展开**完整排版详情卡片 (Font Spec Card)**。
- 卡片位置：页面右上角（可拖拽浮动），不遮挡被点击区域。

### 模式 B：全页排版审计 (Page Font Audit)

- 卡片右上角 `[Audit]` 按钮一键触发。
- 自动扫描当前页面（含同源 iframe 和 Shadow DOM）所有实际渲染的 `font-family`。
- 输出清单：字体族名称 + 出现频次 + 所用字重列表。

---

## 4. 排版详情卡片结构 (Font Spec Card — Figma Typography Replica)

```
┌───────────────────────────────────────────┐
│  字体排印 (Typography)     [F]  [Copy]  [Audit] │
├───────────────────────────────────────────┤
│  Inter, -apple-system, sans-serif       ▼ │  ← Font Family（全宽）
├───────────────────────────────────────────┤
│  SemiBold · 600           ▼ │ 16px      ▼ │  ← Weight / Size（双栏）
├───────────────────────────────────────────┤
│  ↕ 24px (150%)               ↔ 0px (0em) │  ← Line Height / Letter Spacing（双栏）
├───────────────────────────────────────────┤
│  [≡L] [≡C] [≡R]    [⊤] [⊟] [⊥]   ■ #1E293B │  ← Alignment / Fill Color
├───────────────────────────────────────────┤
│  [ ↓ Inter-SemiBold.woff2 ]               │  ← 字体文件下载（若探测到）
└───────────────────────────────────────────┘
```

### 4.1 各行详细说明

| 区域 | 内容 | 交互 |
| :--- | :--- | :--- |
| **标题栏** | `字体排印 (Typography)` 模块名称 | `[F]` 跳转 Google Fonts；`[Copy]` 复制完整 CSS；`[Audit]` 切换全页审计 |
| **第一行（全宽）** | Font Family 完整栈（如 `Inter, -apple-system, sans-serif`） | 点击复制 family 名 |
| **第二行（双栏）** | 左：字重（`SemiBold · 600`）；右：字号（`16px / 1rem`） | 各自点击复制 |
| **第三行（双栏）** | 左：行高（`24px / 150%`）带行高图标；右：字距（`0px / 0em`）带字距图标 | 精准显示像素与百分比/em 双单位 |
| **第四行（多组）** | 水平对齐（left/center/right）；垂直对齐（top/middle/bottom）；颜色色块 + Hex | 色块点击复制颜色值 |
| **下载行** | 探测到真实字体文件时展示下载按钮（含文件名与格式） | 点击直接保存字体文件至本地 |

---

## 5. 网页字体源文件嗅探器 (Web Font Sniffer)

### 5.1 双引擎探测

**引擎一：CSS @font-face 解析**

```javascript
for (const sheet of document.styleSheets) {
  for (const rule of sheet.cssRules) {
    if (rule instanceof CSSFontFaceRule) {
      // 解析 src: url(...) 获取真实文件地址
      // 匹配 .woff2 / .woff / .ttf / .otf
    }
  }
}
```

**引擎二：性能资源监控捕获**

```javascript
performance.getEntriesByType('resource')
  .filter(entry => /\.(woff2?|ttf|otf|eot)/.test(entry.name))
```

两引擎结果合并去重，以 `@font-face` 解析结果为优先（精确度更高）。

### 5.2 文件格式优先级

探测到多个格式时，优先展示 / 推荐下载顺序：

```
.woff2 > .woff > .ttf > .otf > .eot
```

### 5.3 下载机制

- 直接通过 `<a download>` + `fetch()` 触发浏览器下载，无需额外权限。
- 文件名来源：URL 最后一段路径（如 `Inter-SemiBold.woff2`）。

---

## 6. Google Fonts 识别与直达

内置 Google Fonts 常用字体指纹库（Inter、Roboto、Outfit、Plus Jakarta Sans、Noto Sans、Montserrat 等）。

识别到匹配字体时：
- 卡片标题栏 `[F]` 按钮高亮激活。
- 点击直达 `https://fonts.google.com/specimen/{FontName}` 官方字体规格/下载页。

---

## 7. 一键复制 CSS 规范

`[Copy]` 按钮将当前检视到的完整排版规则写入剪贴板：

```css
font-family: "Inter", -apple-system, sans-serif;
font-weight: 600;
font-size: 16px;
line-height: 24px;
letter-spacing: 0em;
color: #1E293B;
```

---

## 8. 技术实现规范

### 8.1 Shadow DOM 隔离

```javascript
const host = document.createElement('div');
host.id = '__figma_font_inspector_host__';
const shadowRoot = host.attachShadow({ mode: 'open' });
document.body.appendChild(host);
```

所有 UI（Pill 气泡、Font Spec Card）均在此 Shadow Root 内渲染，不受宿主页面 CSS 干扰。

### 8.2 性能设计

- 悬停侦测使用 `mouseover` + `requestAnimationFrame` 节流，保障 60FPS 流畅度。
- 点击锁定后暂停悬停侦测，减少不必要的计算。

### 8.3 退出机制

| 操作 | 行为 |
| :--- | :--- |
| 按 `Esc` | 立即关闭所有检视 UI，退出侦测模式 |
| 点击卡片 `×` | 关闭 Font Spec Card，回到悬停侦测状态 |
| 再次点击工具栏按钮 | Toggle 关闭，完全退出 |
| 点击工具栏其他按钮 | 自动关闭字体检视器 |

---

## 9. 全局开关 (Toggle API)

`font-inspector.js` 暴露以下全局接口，供 background.js 远程调用：

```javascript
window.figmaFontInspector = {
  toggle()  // 开/关切换
  enable()  // 强制开启
  disable() // 强制关闭
};
```
