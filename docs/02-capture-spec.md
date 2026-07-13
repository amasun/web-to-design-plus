# 02 — 网页捕获与剪贴板传导规范 (Capture & Clipboard Spec)

## 1. 功能概述

核心功能：将任意网页内容（全屏或局部元素）通过 DOM 语义化序列化，以 Figma 可直接解析的 JSON 格式写入系统剪贴板，用户在 Figma 内 `Ctrl/Cmd + V` 即可生成可编辑的图层结构。

---

## 2. 两种捕获模式

### 2.1 Entire Screen（全屏捕获）

**入口**：主工具栏 `Entire screen` 按钮。

**流程**：

```
用户点击 "Entire screen"
  → inpage-toolbar 发送 FIGMA_RUN_ENTIRE_SCREEN_CAPTURE 至 background.js
  → 显示 Capturing... 提示气泡
  → background.js 调用 Chrome Debugger API 设置设备视口尺寸（可选）
  → 注入 runner.js → 调用 capture.js 遍历 body 整棵 DOM 树
  → 序列化为 Figma JSON → 写入剪贴板
  → 回传 FIGMA_CAPTURE_STATE: success → 显示成功气泡
```

**视口尺寸选项（Advanced Settings）**：

| 选项 | 行为 |
| :--- | :--- |
| `Auto` | 使用当前浏览器视口尺寸，不启动 Debugger |
| 预设分辨率（如 `1440×900`） | 通过 Chrome Debugger API `Emulation.setDeviceMetricsOverride` 强制设置宽高 |
| `Custom` | 用户自定义宽度和高度（输入框） |

**自动滚动 (Auto Scroll)**：默认开启，截图前自动滚动页面以加载懒加载内容。

### 2.2 Select Element（局部元素捕获）

**入口**：主工具栏 `Select element` 按钮。

**流程**：

```
用户点击 "Select element"
  → 工具栏切换至 Selection Indicator 提示条（Click to select · ↑↓ Navigate · Enter Confirm）
  → 页面进入元素侦测模式：
      mouseover → 高亮当前 hover 元素（绿色细边框 + 半透明遮罩）
      键盘 ↑↓ → 遍历 DOM 上下层级
      Enter / Click → 锁定目标元素
  → 发送 FIGMA_RUN_ELEMENT_CAPTURE（携带目标 CSS selector）
  → 同全屏模式的 capture.js 序列化流程，范围限定为目标元素
```

---

## 3. DOM 序列化策略 (Capture Engine)

`capture.js` 实现以下遍历与转换逻辑：

- **递归遍历**：深度优先遍历目标 DOM 树，包含同源 `iframe` 内容。
- **样式计算**：对每个节点调用 `window.getComputedStyle()` 获取所有最终渲染样式。
- **资源处理**：图片、背景图等外部资源通过 `background.js` 的 CORS 代理服务转为 Base64。
- **输出格式**：序列化为 Figma 专用 JSON 格式，包含图层树、样式属性、文字内容等。

---

## 4. CORS 图片代理 (Asset Proxy)

由于跨域资源限制，外部图片无法在页面上下文中直接读取为 Base64，因此通过 Service Worker 进行代理：

- **并发数**：默认 8 并发，可在扩展选项中调整（4 / 6 / 8 / 10 / 12 / 16 / 20）。
- **缓存层级**：Memory Cache → Session Cache，避免重复请求相同资源。
- **超时处理**：单资源请求设有超时阈值，超时自动跳过不阻塞整体截图。

---

## 5. 剪贴板传导协议

- 数据**直接写入系统剪贴板**，不生成任何临时文件或下载弹窗。
- 用户在 Figma 中 `Ctrl+V` / `Cmd+V` 即可粘贴，Figma 会自动识别 JSON 格式并生成可编辑图层。
- **无需安装 Figma 插件**。

---

## 6. 状态提示流转 (UI State Machine)

```
初始态（Main Panel）
  → [点击 Entire screen] → Capturing...（气泡）
      → 成功 → Copied to Clipboard ✓ → 3s 后回到初始态
      → 失败 → Error 提示 → 3s 后回到初始态

初始态
  → [点击 Select element] → Selection Indicator（选择提示条）
      → [点击/Enter 确认] → Capturing...（气泡）
          → 成功 / 失败（同上）
      → [Cancel] → 回到初始态
```

---

## 7. 设备视口仿真技术细节

当选择非 Auto 分辨率时，background.js 执行以下步骤：

1. `chrome.tabs.setZoom(tabId, 1.0)` — 重置 zoom 至 100% 保证布局精度。
2. `chrome.debugger.attach` — 附加 Chrome Debugger。
3. `Emulation.setDeviceMetricsOverride` — 设置目标宽高 + `deviceScaleFactor: 1`。
4. `sleep(500)` — 等待 CSS 媒体查询重排完成。
5. 执行截图捕获。
6. `Emulation.clearDeviceMetricsOverride` + `chrome.debugger.detach` — 清理还原。
