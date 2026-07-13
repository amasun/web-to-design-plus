# 03 — SVG 矢量深度提取规范 (SVG Grabber Spec)

## 1. 功能概述

**Grab SVG** 功能专为设计师和前端工程师在网页中快速提取、识别并下载可复用矢量图标资源而设计。

核心特性：
- **多层穿透**：递归穿透同源 `iframe` 与 Shadow DOM，发现任意嵌套层级下的 SVG。
- **四级智能语义命名**：通过多维度线索自动推断高质量、有意义的图标文件名。
- **批量提取**：一键提取当前页面所有可识别 SVG 并以原格式打包下载。

---

## 2. 触发入口

主工具栏 `Grab SVG` 按钮。

点击后 `inpage-toolbar.js` 发送 `FIGMA_RUN_SVG_GRABBER` 消息至 `background.js`，background.js 通过 `chrome.scripting.executeScript` 向当前 Tab 注入 `svg-grabber.js`。

---

## 3. DOM 穿透策略

### 3.1 同源 iframe 穿透

```javascript
// 递归检查每个 iframe
document.querySelectorAll('iframe').forEach(iframe => {
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    // 继续在 iframeDoc 中搜索 SVG
  } catch (e) {
    // 跨域 iframe 无法访问，静默跳过
  }
});
```

仅支持与扩展页面**同源**的 iframe，跨域 iframe 因浏览器安全限制无法访问。

### 3.2 Shadow DOM 穿透

```javascript
// 检测 Web Components 中的 Shadow Root
element.shadowRoot && searchSVGsIn(element.shadowRoot);
```

对每个 DOM 节点检查是否有 `shadowRoot`，并递归在其中搜寻 SVG 元素。

---

## 4. 四级语义命名引擎 (Semantic Naming Engine)

为了生成有实际意义的图标文件名（而非 `icon_01.svg`、`untitled.svg` 等无意义名称），系统按以下优先级依次尝试推断：

### 级别 1：CSS 类名语义推断（最高优先级）

从 SVG 元素自身及其祖先节点的 `class` 属性中提取语义化关键词：

- **Lucide Icons 命名规律**：匹配 `lucide-*` 类名前缀 → 提取 `lucide-arrow-right` → `arrow-right`
- **Font Awesome 命名规律**：匹配 `fa-*` 类名 → 提取 `fa-home` → `home`
- **通用语义关键词**：过滤掉布局/状态类（`flex`、`active`、`visible`等），提取含义明确的名词性词汇

```
class="icon lucide-arrow-right size-4" → "arrow-right"
class="fa fa-home" → "home"
class="btn-icon download-icon" → "download-icon"
```

### 级别 2：SVG 内部 ID 推断

检查 SVG 树中 `<mask>`、`<clipPath>`、`<defs>` 等子元素的 `id` 属性：

```xml
<mask id="icon-search-mask"> → "search"
<clipPath id="avatar-clip"> → "avatar"
```

### 级别 3：相邻兄弟/父级文本内容推断

SVG 图标通常与文字标签相邻（如按钮文字、菜单文字），从相邻节点提取文本内容：

```html
<button>
  <svg>...</svg>
  <span>Download Report</span>  ← 提取 "download-report"
</button>
```

提取流程：清理特殊字符 → 转小写 → 截取前 32 字符 → 空格替换为连字符。

### 级别 4：默认兜底命名（最低优先级）

当以上三级均无法提取有意义名称时，使用：
- `icon` + 序号（如 `icon-01`、`icon-02`）
- 或基于 SVG 中 `viewBox` 推测用途（如方形 `viewBox="0 0 24 24"` → `icon-24px`）

---

## 5. SVG 过滤与去重策略

并非页面中所有 SVG 都是图标，过滤规则如下：

| 过滤条件 | 描述 |
| :--- | :--- |
| 极小尺寸 | 宽或高 < 8px，认为是装饰性 SVG，跳过 |
| 极大尺寸 | 宽或高 > 1000px，认为是背景图或插图，独立分组 |
| 无 viewBox | 缺少有效 `viewBox` 的内联 SVG，跳过 |
| 重复内容去重 | 对 SVG 序列化后进行哈希对比，过滤完全相同的重复图标 |

---

## 6. 输出格式

- 单个 SVG：优化压缩后直接下载为 `.svg` 文件，文件名为语义命名结果。
- 批量导出：所有识别到的 SVG 打包为 `.zip` 文件（按命名排序）。
- SVG 内容均经过**最小化清理**：移除不必要的注释、编辑器元数据（Illustrator/Sketch 私有属性等）。

---

## 7. UI 交互流程

```
用户点击 "Grab SVG"
  → 注入 svg-grabber.js
  → 遍历全页 DOM（含 iframe + Shadow DOM）收集 SVG
  → 在页面右侧弹出 SVG 预览面板（Shadow DOM 隔离）：
      - 网格展示所有识别到的图标缩略图
      - 显示推断的语义文件名
      - 每个图标支持单独下载
      - 顶部提供 "Download All (.zip)" 批量下载按钮
  → 点击面板外或 Esc 关闭
```
