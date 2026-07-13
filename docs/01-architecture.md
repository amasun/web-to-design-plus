# 01 — 全局架构与 UI 设计系统 (Architecture & Design System)

## 1. 宏观架构

Web to Design Plus 基于 **Chrome Manifest V3** 扩展规范构建，由以下层次组成：

```
┌─────────────────────────────────────────────────────────┐
│                   Chrome Extension                       │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ background.js │    │ manifest.json │                   │
│  │ (Service Worker)│   │ (MV3 Config)  │                   │
│  └──────┬───────┘    └──────────────┘                   │
│         │ chrome.scripting.executeScript                 │
│         ▼                                                │
│  ┌───────────────────────────────────────────────┐      │
│  │             Target Web Page (Tab)              │      │
│  │                                                │      │
│  │  ┌──────────────────┐  ┌───────────────────┐  │      │
│  │  │ inpage-toolbar.js │  │  font-inspector.js │  │      │
│  │  │  (Shadow DOM UI) │  │  (Shadow DOM UI)  │  │      │
│  │  └──────────────────┘  └───────────────────┘  │      │
│  │  ┌────────────────┐    ┌──────────────────┐   │      │
│  │  │ svg-grabber.js │    │   capture.js     │   │      │
│  │  │ (DOM traversal)│    │  (screenshot)    │   │      │
│  │  └────────────────┘    └──────────────────┘   │      │
│  └───────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 消息路由总线 (Message Bus)

| 消息类型 | 发送方 | 接收方 | 功能 |
| :--- | :--- | :--- | :--- |
| `FIGMA_RUN_ENTIRE_SCREEN_CAPTURE` | `inpage-toolbar.js` | `background.js` | 触发全屏截图 |
| `FIGMA_RUN_ELEMENT_CAPTURE` | `inpage-toolbar.js` | `background.js` | 触发局部元素截图 |
| `FIGMA_RUN_SVG_GRABBER` | `inpage-toolbar.js` | `background.js` | 注入 SVG 提取器 |
| `FIGMA_RUN_FONT_INSPECTOR` | `inpage-toolbar.js` | `background.js` | 注入字体检视器 |
| `FIGMA_CAPTURE_STATE` | `background.js` | `inpage-toolbar.js` | 回传截图状态 |
| `FIGMA_CAPTURE_FETCH_ASSET` | `capture.js` | `background.js` | CORS 代理资源 |

---

## 2. Shadow DOM 隔离机制

所有注入页面的 UI 均通过以下模式创建，**彻底隔离**于宿主页面：

```javascript
const host = document.createElement('div');
host.id = '__figma_capture_toolbar_host__';
const shadowRoot = host.attachShadow({ mode: 'open' });
document.body.appendChild(host);
// 所有样式和 DOM 均附加在 shadowRoot 内，对外完全不可见
```

### 各模块 Shadow DOM Host 标识符

| 模块 | Host Element ID |
| :--- | :--- |
| 主工具栏 | `__figma_capture_toolbar_host__` |
| 字体检视器 | `__figma_font_inspector_host__` |
| 元素高亮遮罩 | `__figma_capture_highlight__` |

---

## 3. Design Tokens 体系

所有 UI 均基于统一的 CSS Custom Properties（Design Tokens）定义，通过 `:host` 范围挂载，确保任何组件内部均可访问，且不泄露至宿主页面。

### 色彩 Tokens

| Token 名称 | 值 | 语义描述 |
| :--- | :--- | :--- |
| `--token-color-accent` | `#d4fc5d` | 主高亮色（黄绿电光色），用于焦点/激活状态 |
| `--token-color-accent-text` | `#000000` | Accent 背景上的文字色 |
| `--token-color-bg-panel` | `rgba(44,44,44,0.87)` | 主面板背景（毛玻璃深色） |
| `--token-color-bg-btn` | `rgba(255,255,255,0.12)` | 按钮默认背景 |
| `--token-color-bg-btn-disabled` | `rgba(192,206,231,0.08)` | 禁用按钮背景 |
| `--token-color-bg-popover` | `rgba(24,24,27,0.95)` | 弹出层背景 |
| `--token-color-bg-subtle` | `rgba(255,255,255,0.05)` | 次要区块背景 |
| `--token-color-bg-item-hover` | `rgba(255,255,255,0.10)` | 列表项悬停背景 |
| `--token-color-text-primary` | `rgba(255,255,255,0.9)` | 主要文字 |
| `--token-color-text-secondary` | `rgba(255,255,255,0.6)` | 次要文字（标签/说明） |
| `--token-color-text-muted` | `rgba(255,255,255,0.45)` | 弱化/占位文字 |
| `--token-color-error` | `#f87171` | 错误/告警状态 |

### 边框 Tokens

| Token 名称 | 值 | 用途 |
| :--- | :--- | :--- |
| `--token-border-default` | `rgba(255,255,255,0.1)` | 普通边框线 |
| `--token-border-strong` | `rgba(163,163,163,0.47)` | 强调边框（输入框/面板外沿） |
| `--token-border-accent` | `var(--token-color-accent)` | 聚焦 / 激活边框 |

### 阴影 Tokens

| Token 名称 | 用途 |
| :--- | :--- |
| `--token-shadow-panel` | 主面板投影（立体感） |
| `--token-shadow-popover` | 下拉弹出层投影 |
| `--token-shadow-focus` | 输入框/按钮键盘聚焦光晕 |

### 圆角 Tokens

| Token 名称 | 值 |
| :--- | :--- |
| `--token-radius-sm` | `4px` |
| `--token-radius-md` | `6px` |
| `--token-radius-lg` | `8px` |
| `--token-radius-xl` | `16px` |
| `--token-radius-full` | `50%` |

### 动画过渡 Tokens

| Token 名称 | 值 |
| :--- | :--- |
| `--token-transition-fast` | `0.15s cubic-bezier(0.4,0,0.2,1)` |
| `--token-transition-normal` | `0.25s cubic-bezier(0.4,0,0.2,1)` |

---

## 4. 构建链路 (Build Pipeline)

### 文件清单

| 文件 | 职责 |
| :--- | :--- |
| `src/manifest.json` | Chrome MV3 扩展清单（权限/脚本声明） |
| `src/background.js` | Service Worker：消息路由 + 脚本注入 + CORS 代理 |
| `src/inpage-toolbar.js` | 主悬浮工具栏 UI（Shadow DOM） |
| `src/capture.js` | DOM 序列化与截图核心逻辑 |
| `src/runner.js` | 截图任务编排执行器 |
| `src/svg-grabber.js` | SVG 深度提取与语义命名 |
| `src/font-inspector.js` | 字体排版检视与下载器 |
| `src/offscreen.js` | Offscreen Document：Canvas 合图 |
| `build.js` | 构建脚本（Terser 压缩 + dist 输出） |

### 构建命令

```bash
node build.js
```

输出至 `dist/` 目录，可直接通过 Chrome `Load unpacked` 加载。

---

## 5. `.gitignore` 规范

```gitignore
dist/            # 构建产物，不提交
node_modules/    # 依赖，不提交
preview/         # 本地开发预览页，不提交至远程
.*/              # 所有 dot 目录（.vscode/ .claude/ 等）均忽略
```
