# Web to Design Plus — Design & Technical Specifications Archive

**Web to Design Plus** 浏览器扩展全功能模块设计规范与技术架构文档归档中心。

---

## 功能模块索引 (Feature Module Index)

| 文档 | 模块 | 描述 |
| :--- | :--- | :--- |
| [01-architecture.md](./01-architecture.md) | 全局架构 & UI 设计系统 | Shadow DOM、Design Tokens、构建链路 |
| [02-capture-spec.md](./02-capture-spec.md) | 网页捕获与剪贴板传导 | 全屏/局部截图、设备仿真、Figma 粘贴协议 |
| [03-svg-grabber-spec.md](./03-svg-grabber-spec.md) | SVG 矢量深度提取 | 多层穿透、四级语义命名引擎 |
| [04-whats-the-font-spec.md](./04-whats-the-font-spec.md) | What's the Font 排版检视 | Typography 卡片、全页审计、字体文件下载 |

---

## 设计核心原则 (Design Principles)

1. **绝对隔离 (Zero Leakage)**：所有注入 UI（主工具栏、字体卡片、高亮提示）均强制封装于 Shadow DOM 容器内，杜绝宿主页面样式污染双向干扰。
2. **剪贴板即时互通 (Direct-to-Clipboard)**：所有数据无需生成临时文件，直接写入剪贴板以供 `Ctrl/Cmd + V` 在 Figma 中一键粘贴解析。
3. **高亮色标准 `#D4FC5D`**：扩展所有交互高亮、焦点边框、Accent 元素统一使用鲜亮电光黄绿色，确保与任意宿主页面背景的视觉区分度。
4. **毛玻璃极简 UI (Glassmorphism)**：扩展所有注入界面均采用深色半透明毛玻璃风格 (`rgba(44,44,44,0.87)` 背景 + 模糊滤镜)。
