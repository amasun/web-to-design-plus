# Web to Design Plus - 项目交接文档 (Handoff)

## 当前项目进度 (Current Status)
- 已完成核心功能 `font-inspector.js` (字体检查面板) 的 UI 重构与交互修复。
- 成功解决了由于宿主网页环境（如 Figma.com、React 等）引发的极端 DOM 事件劫持与“幽灵面板”问题。
- 代码构建流程跑通，通过 `node build.js` 重新编译更新 `dist` 文件。
- 已移除根目录下不需要的无用临时脚本文件。

## 核心设计决策 (Key Design Decisions)
- **UI 审美**: 面板遵循高级感极简设计，使用纯原生 CSS、支持明暗自适应。
- **无依赖架构**: 采用 Chrome Extension MV3 架构，直接利用 Vanilla JS 注入 Shadow DOM 进行样式隔离，不引入沉重的框架（如 React/Vue）。
- **极简构建**: 使用原生的 `build.js` 将 `src` 文件夹进行压缩合并至 `dist`。

## 已解决的 Bug 与极其珍贵的技术经验 (Resolved Bugs & Lessons Learned)

### 1. 点击文字强制变色的问题
- **现象**: 之前在 Font Inspector 激活时，点击网页文字会被强制变为红色。
- **解决**: 移除了 `lockedTarget.style.color` 修改逻辑，现在面板仅嗅探信息，不对原网页文字进行破坏性着色。

### 2. 拖拽失效的闭包陷阱 (Drag Bug)
- **现象**: 拖拽事件监听器中的 `panelEl` 变量报 `null`。
- **原因**: 插件 Content Script 执行多次或由于切换状态导致全局闭包变量被置为 `null`，但真实的 DOM 元素仍在屏幕上。
- **解决**: 弃用对外部闭包 `panelEl` 变量的依赖。在 `onmousedown` 中使用 `e.currentTarget.closest(".fi-panel")`，**直接从真实 DOM 树中抓取节点**进行移动计算，保证了 100% 的容错率。

### 3. 关闭按钮失效与“幽灵面板”问题 (Close Button & Ghost Panel Bug)
- **现象**: 能够拖拽，但点击关闭按钮毫无反应，或者点击之后控制台报 Null 错，面板却一直停留在页面上（幽灵面板）。
- **深层原因 A（Click 事件被扼杀）**: 宿主网页（如带有复杂自定义鼠标交互的站点，或使用了禁止选中文本库的站点）会在 `window` 级别提前捕获 `mousedown` 并强制调用 `e.preventDefault()`。这会导致浏览器**直接取消后续的 `click` 事件**。我们原本监听 `onclick` 就永远不会触发。
- **深层原因 B（被宿主框架暗中转移）**: 原代码判断面板是否存在的逻辑是 `document.body.contains(hostEl)`。某些网页的 DOM diff 算法或绝对定位层管理，会把我们的 `hostEl` 悄悄移出 `body`。导致再次打开时，插件以为它没了，创建了“新面板”，而“旧面板”就成了无法被 `remove()` 的幽灵。
- **最终解决策略（必须牢记的坑）**:
  1. **放弃 `onclick`，拥抱 `onmousedown`**: 将关闭按钮的触发全部改到 `onmousedown` 上，强制阻断事件冒泡（`e.stopPropagation()`），并在此阶段直接关闭面板。彻底绕开了宿主网页的 click 劫持。
  2. **放弃对象级引用，使用绝对 ID 追杀**: 无论是注入时还是移除时，不再检查 `body.contains`，而是直接调用 `document.getElementById("__figma_font_inspector_host__")`。不管 React 把它移到了天涯海角，只要在当前页面，一律抓出来 `remove()`，彻底终结了幽灵面板现象。

## 下一步计划与建议 (Next Steps)
1. **统一事件绑定规范**: 未来开发该插件其它功能（如图标抓取面板、颜色抓取面板）时，务必参考此次 `font-inspector.js` 的 `onmousedown` 事件绑定方式，避免再次踩坑。
2. 
   - 建议在各种复杂的现代框架（Vue, React, Figma 等）网页上对插件的覆盖率和样式隔离进行压力测试。
