## 项目概述
- 项目目标：Chrome 扩展 **Web to Design Plus** —— 一键抓取网页（整屏或选中元素）并转换成可编辑的 Figma 设计稿，同时提供一个注入到页面内的悬浮工具条（toolbar）UI。
- 技术栈：原生 JS（无框架）+ Chrome Extension Manifest V3（service worker + content scripts + offscreen document）。构建用 `build.js`（Node 脚本，用 `terser` 压缩 `src/*.js` 到 `dist/`，不做打包/转译，纯拷贝+压缩）。
- 目录结构：
  - `src/manifest.json` — MV3 manifest（开发态名称带 `(Dev)` 后缀，`build.js` 打包时会去掉）
  - `src/background.js` — service worker，负责注入 `capture.js`/`inpage-toolbar.js`、处理 Figma 图片代理抓取队列（并发/缓存/诊断）等
  - `src/capture.js` — 注入到页面 `ISOLATED` world，实现 `window.figma.captureForDesign`，做实际的 DOM→设计稿数据抓取
  - `src/inpage-toolbar.js` — 注入到页面的悬浮工具条 UI（Shadow DOM 隔离），本次会话的主要改动文件
  - `src/offscreen.html` / `src/offscreen.js` — offscreen document，用于剪贴板写入等 service worker 不能直接做的操作
  - `dist/` — `npm run build` 产物，不要手动改这里的文件，改 `src/` 后重新 build

## 当前进度
- 已完成（本次会话）：
  1. **面板间共享布局动画（FLIP）**：`src/inpage-toolbar.js` 中新增 `setWrapperContent(wrapper, html)` 辅助函数，在切换 `showMainPanel` / `showSelectionIndicator` / `showCapturingIndicator` / `showSuccessIndicator` / `showErrorIndicator` 五个状态时，先测量旧尺寸→替换内容→测量新尺寸→用 CSS transition（`.wrapper-outer` 新增 `width`/`height` 过渡，0.35s）从旧尺寸平滑过渡到新尺寸，而不是瞬间跳变。所有原来直接 `wrapper.innerHTML = ...` 的调用点都已替换为 `setWrapperContent(wrapper, ...)`。
  2. **Footer 信息图标加超链**：`footer-section` 里的小红书 icon 从裸 `<svg>` 包了一层 `<a class="info-link" href="https://www.xiaohongshu.com/user/profile/5c094b50f7e8b948da476607" target="_blank" rel="noopener noreferrer">`，并加了 `.info-link` 的 hover 透明度过渡样式。
- 进行中：无
- 待完成 / 待验证：
  - **尚未在真实 Chrome 里加载扩展做人工验证**（无法在当前环境启动浏览器）。需要手动 `chrome://extensions` 加载 `dist/`（或直接指向 `src/` 调试）后，走一遍：主面板 → 选择元素 capsule → 截图中 capsule → 成功/失败 capsule 的切换，确认 FLIP 尺寸过渡动画观感（速度/缓动曲线是否合适）。
  - 需要确认**拖拽工具条后**再触发面板切换，不会因为 `mousedown`/`mouseup` 里内联覆盖的 `wrapper.style.transition`（只含 opacity/transform）而导致某次尺寸切换瞬间跳变（理论上不冲突，因为拖拽期间不会改变宽高，但未实测）。
  - 之前 git 历史里提到的“shared element layout transitions”系列改动（`d264240` 等）是否还有后续收尾工作，未在本次会话核实。

## 关键决策记录
- **尺寸动画用手写 FLIP 而不是引入动画库**：项目是纯原生 JS 扩展，没有 React/Framer Motion 等依赖，也不想为一个交互引入打包复杂度，所以用 `getBoundingClientRect` + inline `width/height` + CSS transition 手动实现 First-Last-Invert-Play。
- **过渡属性放在 `.wrapper-outer` 的 CSS class 里，而不是每次内联设置 `transition`**：因为 `setupDragging()` 里拖拽时会临时把 `wrapper.style.transition` 设为 `"none"` / `"opacity 0.2s ease, transform 0.2s ease"`。如果 FLIP 动画也用内联 `transition` 会互相覆盖冲突，所以选择把 `width`/`height` 过渡写进 class 规则，`setWrapperContent` 只改 `style.width/height` 的值，不碰 `style.transition`，避免和拖拽逻辑打架。
- **圆角（border-radius）没有做动画**：所有面板状态共用同一个 `wrapper-outer`，其 16px 圆角始终不变（历史提交 `d264240` 已经把卡片视觉样式统一到 `wrapper-outer` 上），因此本次只需要动画 width/height，不需要额外处理 radius 差异。

## 工作流约定
- **重大改动要实时同步到 git**：完成一个功能点/明显的一批改动后就提交一次 commit，不要攒一堆改动最后才一次性提交。commit message 用简洁的中文或英文描述"做了什么+为什么"。

## 已知问题/坑
- `src/inpage-toolbar.js` 里的 `setWrapperContent` 依赖 `transitionend` 事件来清理内联 `width`/`height`；如果某次尺寸没有变化（`Math.abs(...) < 1`），函数会提前 `return`，不会触发 transition，也不会挂 `transitionend` 监听——这是有意为之（尺寸没变就不需要动画/清理），但如果以后有新状态导致宽高一直有 1px 以内的抖动，可能出现内联样式残留，需要注意。
- Chrome 扩展没有热重载，改完 `src/*.js` 后需要在 `chrome://extensions` 手动点“重新加载”，且已打开的页面要刷新才会重新注入 content script。
- `dist/` 是构建产物，任何改动应该改 `src/` 然后跑 `npm run build`（脚本：`node build.js`），不要直接改 `dist/`。
