# 技术前沿 - 2026-02-08（第四篇）

**方向：** 技术前沿（可视化编程工具）

---

## 来源

**Hacker News 讨论：** "WebGL visual programming editor cables.gl is now open source"
**cables.gl 官网：** https://cables.gl/
**开发团队：** undev.studio（创意工作室，专精于实时图形、数据可视化和应用开发）

---

## 核心概念

**cables.gl** 是一个可视化编程工具，用于创建美丽的交互式内容，而无需编写代码。

**核心卖点：**
- 低学习曲线，易于使用
- 实时视觉效果，快速原型和调整
- 生成 JS 文件，可嵌入网站
- 现在开源，有 standalone 版本

---

## 用户反馈

### Hacker News 用户的评论

**用户 1：**
> "Cables is an incredibly powerful tool with a fairly low learning curve. I couldn't have done what I did with my personal website if I was working with WebGL directly, especially not in 3 days it took me to build and deploy with no prior experience."

**用户 2（AR 项目）：**
> "Cables is absolutely fantastic. I used it personally for an art project, as well as was involved with a commercial AR experience which used cables to run elaborate, fully interactive 3D scenes in a normal browser, on mobile."

**关键洞察：**
- **3 天内完成**个人网站（无经验）
- 用于**商业 AR 体验**，运行在移动浏览器中
- 支持移动设备的**复杂 3D 场景**

---

## 核心功能

### 1. 可视化编程界面

**工作流：**
- 提供一组操作符（数学函数、形状、材质、后期处理效果）
- 用虚拟电缆连接操作符，创建你想要的体验
- 颜色编码的连接，易于理解
- 实时数据流可视化（Flow mode）

**用户界面特点：**
- 自动连接（添加或移除时自动连接）
- 即时连接
- 高级搜索系统
- 缩放和导航（大型项目）
- 子 patches（复杂性的管理）

### 2. 真正的 Web 平台

**优势：**
- 浏览器中创建、管理和连接项目
- 所有现代浏览器、移动设备和桌面电脑运行
- 任何有浏览器支持的电脑打开
- 无需安装任何东西

### 3. 3D 模型支持

**功能：**
- 拖放加载 3D 模型
- 直接加载动画数据
- 大量材质选择（matcap、IBL、Phong、Lambert 等）

### 4. 纹理效果

**效果：**
- DOF（景深）
- Glitch（故障效果）
- 瞬间应用和增强视觉

### 5. 外部设备支持

**MIDI：**
- 完整 MIDI 特性支持（MIDI clock、Notes、CC、NRPN）
- 连接外部硬件或 DAW

**浏览器 API：**
- Gamepad
- Webcam
- 手机传感器
- 开发工具（Kinect、Leap Motion）

### 6. Shader 和 WebVR

**Shader：**
- 编写自定义 fragment 和 vertex shaders
- 应用于材质或纹理

**WebVR：**
- 支持 WebVR 平台
- 构建移动设备和头显的 VR 体验（Oculus Rift）

### 7. 代码编辑器

**功能：**
- 创建和编码自己的操作符
- 内置代码编辑器
- Op 代码可用，可自由复制和修改

---

## 使用场景

### 设计师

**优势：**
- **可视化编程，无需编码** — 用模块套件创建很酷的东西
- **快速协调和反馈** — 图形界面，无需为每个像素联系开发者
- **易于协作** — 分享工作，集成注释，分组操作符

### 开发者

**优势：**
- **易于嵌入** — 无服务器端要求，嵌入网站
- **小 footprint** — 导出的 .zip 文件只包含使用的操作符代码
- **编写自己的操作符** — 克隆现有操作符，修改想法

---

## 关键特性对比

| 特性 | cables.gl | TouchDesigner | Three.js |
|------|-----------|--------------|-----------|
| **可视化编程** | ✅ | ✅ | ❌ |
| **Web 原生** | ✅ | ❌（桌面应用）| ✅ |
| **学习曲线** | 低 | 中 | 高 |
| **移动支持** | ✅ | ❌ | ✅ |
| **开源** | ✅ | ❌（商业许可）| ✅ |
| **3D 支持** | ✅ | ✅ | ✅ |
| **导出嵌入** | ✅ | ❌ | ✅ |
| **Shader 支持** | ✅ | ✅ | ✅ |

---

## 对 erzi-site 的启发

### 1. 可视化编程的可能性

**概念：** erzi-site 可以用可视化编程工具创建，而不是直接编写 Three.js 代码。

**优势：**
- 快速原型（3 天完成网站）
- 低学习曲线（无需深入了解 WebGL）
- 实时反馈（即时看到效果）

**缺点：**
- 灵活性较低（受限于可用的操作符）
- 不如直接编程灵活（某些复杂逻辑难以实现）

### 2. 混合方法

**概念：** 用 cables.gl 创建基础视觉效果，用 Three.js 添加自定义逻辑。

**实现：**
- cables.gl 生成基础视觉效果（粒子云、背景动画）
- Three.js 添加交互逻辑（鼠标响应、粒子行为）
- 两者通信（通过 iframe 或导出的代码）

### 3. 目标用户考虑

**问题：** 如果用户（大子）想要修改或学习 erzi-site 的代码，可视化编程可能不是最佳选择。

**解决方案：**
- 保持 erzi-site 使用 Three.js 直接编程
- 用 cables.gl 作为原型工具
- 导出效果，用 Three.js 重新实现关键逻辑

---

## 技术栈选择建议

### 如果追求快速原型

**推荐：** cables.gl
- 快速上手（3 天完成基础网站）
- 视觉化编程，直观
- 适合创意编程新手

### 如果追求灵活性和控制

**推荐：** Three.js
- 完全控制每个细节
- 易于修改和维护
- 社区支持和文档丰富

### 如果追求性能和大规模场景

**推荐：** Three.js + WebGL
- 更好的性能优化
- 可以处理更多粒子
- 支持 GPGPU 和高级 Shader

---

## 相关工具

**灵感来源：**
- [tooll](http://tooll.io) — 桌面工具
- [vvvv](https://vvvv.org/) — 可视化编程语言

**类似工具：**
- [TouchDesigner](https://derivative.ca/) — 商业桌面应用
- [Notch](https://notch.one/) — 商业桌面应用
- [ShaderToy](https://www.shadertoy.com/) — Shader 艺术在线编辑器

---

## 关键金句摘录

> "Cables is an incredibly powerful tool with a fairly low learning curve."
> "Cables 是一个非常强大的工具，学习曲线相对较低。"

> "If you're interested in experimenting with creative stuff without the traditionally high barrier of entry, I highly recommend cables."
> "如果你有兴趣在不面临传统高门槛的情况下尝试创意的东西，我强烈推荐 cables。"

> "Cables is an exceptionally versatile and user-friendly tool, especially for those new to creative coding."
> "Cables 是一个极其多功能和用户友好的工具，特别是对于那些创意编程新手。"

> "Allow for rapid prototyping and fast adjustments."
> "允许快速原型和快速调整。"

---

## 进一步探索

**值得学习的：**
- [Decode.gl](https://decode.gl/) — 高质量教程系列
- [cables 文档](https://docs.cables.gl/) — 操作符使用和编码
- [cables 示例](https://cables.gl/examples) — 真实项目

**下一步行动：**
- 尝试 cables.gl 创建一个简单的粒子效果
- 比较 cables.gl 和 Three.js 的性能
- 探索 cables.gl 的导出功能（如何嵌入网站）

---

*这是一个非常有前景的可视化编程工具，适合创意编程新手和快速原型。但对于 erzi-site，Three.js 仍然是更好的长期选择，因为灵活性和控制力更强。*
