# WebGPU 在 2025-2026 的实际应用进展

## 核心发现

### 1. 从"有趣的 Demo"到"生产级系统"
2025 年 11 月，WebGPU 正式在 Chrome、Firefox、Safari、Edge 全浏览器支持。这不仅是技术升级，更是 Web 性能的范式转移。

**真实案例：**
- **Google Meet**：背景虚化迁移到 WebGPU，更快更省电
- **Figma**：整个渲染管线从 WebGL 迁移到 WebGPU，因为 WebGL 无法支撑大规模性能需求
- **Three.js/Babylon.js/PlayCanvas**：主流框架已全面支持，开发者无需学习新工具

**性能提升：** Babylon.js 的 Snapshot Rendering 使用 WebGPU Render Bundles，渲染速度提升 **10 倍**（不是 10%，是 10 倍）。

### 2. GPU Compute 才是真正的革命者
大家关注 3D 图形，但 GPU Compute 才是改变游戏规则的能力。

**本地 AI 推理：**
- **Transformers.js + WebGPU**：MiniThinky-v2 (1B) 达到 60 tokens/s，完全在浏览器运行
- **TTS WebGPU**：500M 参数，支持中英韩日，零样本语音克隆，无需联网
- **Google Gemma 2 (2B)**：Jason Mayes 的 WebAI Agent 完全客户端，可用语音或文字控制浏览器自动化任务（如"帮我找下周一去东京的航班"）

这意味着：**隐私保护 + 零延迟 + 无服务器成本**。

### 3. 超越游戏的垂直领域应用
WebGPU 正在渗透专业领域：

**医学成像 + AI：**
- PlisSergey 集成 Niivue（神经成像）和 Tinygrad（深度学习），实时大脑扫描渲染 + AI 推理，无需服务器 GPU

**科学可视化：**
- 全球野火追踪：实时卫星数据，WebGPU 支持流畅缩放和数据交互
- 大数据可视化：金融、城市规划、科学领域，复杂图表交互

**计算生物学：**
- 黏液霉菌模拟（Suboptimal Engineer）：成千上万个粒子实时交互，展示浏览器能处理复杂生物模拟

**流体动力学：**
- MLS-MPM 流体模拟（Matsuoka_601）：30 万粒子实时性能，支持切换 SPH 比较不同算法

### 4. Web 与 Native 的界限进一步模糊
WebGPU + WebAssembly 让浏览器成为真正的通用计算平台：

- **Realishot**：浏览器端 3D 渲染工具，支持光线追踪、Figma 纹理集成、AI 辅助场景设置
- **Utsubo 作品集**：互动 3D 猎豹，桌面级视觉效果在浏览器实现
- **草地渲染**：成千上万片草叶响应风和移动，以前只有原生应用能做到

这对独立开发者意味着：**可以跨设备发布高质量内容，无需适配每个平台的优化噩梦**。

## 我的分析

### WebGPU 不是 WebGL 的进化，而是重设计
文章说得对：这不是 WebGL 2.5，是从零开始的重设计。WebGPU 使用显式管线（explicit pipelines），GPU 知道下一步要做什么，CPU 不再需要微管理。这解释了为什么性能提升是 10 倍级别。

### 浏览器游戏的历史性机遇
WebGPU 解决了浏览器游戏的根本瓶颈：
1. **物理**：复杂物理模拟不再掉帧
2. **AI**：复杂 AI 行为不再卡顿
3. **光照**：动态光照和粒子系统不再性能受限

加上无安装、秒加载、跨设备一致体验，**免费游戏模型将迎来爆发**。从"有兴趣"到"在玩"，从分钟级下载到秒级加载。

### 离线 AI 浪潮的前奏
本地 LLM + WebGPU + 隐私保护 = 浏览器 AI 助手的新范式。

Jason Mayes 的 WebAI Agent 是一个有趣的信号：**AI 不再是聊天机器人，而是浏览器内的自动化代理**。它读网页、填表单、做任务，而且完全本地运行。

### 开发者的机会窗口
生态系统已经成熟（Three.js、Babylon.js 都支持），但用户认知和设备更新有滞后。

**现在入场的人：**
- 可以用 WebGPU 做别人做不到的效果
- 在竞争中建立技术护城河
- 赶在全面普及前积累经验

### 局限与挑战
文章提到：**WebGPU 没有降级方案（fallback）在可预见的未来仍是必需**。不是所有设备都支持，不是所有用户都更新了浏览器。

但这是过渡期的常态，不是长期障碍。设备 GPU 越来越强（2019 年手机 > 2015 年游戏 PC），硬件准备好了。

## 来源 URL
1. [GPU Acceleration in Browsers: WebGPU Performance Benchmarks and Real-World Applications](https://www.mayhemcode.com/2025/12/gpu-acceleration-in-browsers-webgpu.html)
2. [The Best of WebGPU in March 2025](https://www.webgpuexperts.com/best-webgpu-updates-march-2025/)
3. [The Best of WebGPU in January 2025](https://www.webgpuexperts.com/best-webgpu-updates-january-2025)

## 对大子的启发
大子在搞建站，这些进展有几个值得关注的点：
1. **Three.js 已支持 WebGPU**，以后做 3D 效果可以更激进
2. **本地 AI 推理**，如果想给网站加 AI 功能，可以考虑纯前端方案（无服务器成本）
3. **WebAI Agent** 的思路：可以探索 AI 代理在浏览器自动化任务的可能性
4. **数据可视化**：如果要做数据展示，WebGPU 可以支持更复杂的交互
5. **离线优先**：WebGPU 让离线应用更强大，可以探索渐进式 Web 应用（PWA）的新玩法
