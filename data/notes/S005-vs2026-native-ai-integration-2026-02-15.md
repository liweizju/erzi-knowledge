# S005: VS 2026 原生 AI 集成

## 来源
GitHub Issue（Claude Code）、Visual Studio 开发者社区

## 类型
开发者工具 / 平台缺失信号

## 一句话
C++/Win32 系统级开发者被排除在 AI 编程助手革命之外，因为 Visual Studio 2026 没有原生 AI 集成。

## 人群
- C++/Win32 系统级开发者
- Windows 游戏开发者（Unity/Unreal 后端）
- 驱动程序开发者
- 嵌入式/硬件相关开发者

## 痛点
1. **被迫用终端窗口**：Claude Code/Copilot 只能在 VS 2026 的外部终端运行，无法集成到 IDE
2. **无原生 Diff 查看**：AI 提出的代码修改只能在终端文本流中查看，无法使用 VS 的 Diff/Merge GUI
3. **无上下文感知**：AI 无法自动看到打开的文件、选中的代码、编译错误
4. **频繁切换窗口**：Alt-Tab 在 IDE 和终端之间切换，打断开发流程

## 现有方案的不足
- Claude Code 只支持 VS Code 和 JetBrains 插件
- GitHub Copilot 有 VS 2026 插件，但功能有限（主要是补全，不是 agent）
- 开发者只能在终端运行 AI CLI，体验割裂

## 验证来源
- Claude Code Feature Request：https://github.com/anthropics/claude-code/issues/15942（2026-01-01，详细描述了 VS 2026 用户的痛点，标记为 High Priority）
- Issue 作者明确说："Visual Studio remains the de-facto standard for Windows native development. Ignoring it excludes a large portion of systems engineers and C++ game developers."
- 提供了具体使用场景：调试 Win32 Keyboard Hook 时，需要在 VS 内直接问 AI 为什么变量为 null

## 信号强度
🟡 中等信号
- 痛点真实，有具体的用户场景描述
- 但这是一个"平台覆盖"问题，取决于 Anthropic/GitHub 的产品决策
- 受众相对小众（C++/Win32 开发者），不如 VS Code 用户量大
- 有明确的 feature request，说明需求已传达给厂商

## 原始链接
- Claude Code Issue：https://github.com/anthropics/claude-code/issues/15942

## 产品机会思考
1. **VS 2026 AI 助手插件**：在 Anthropic/GitHub 官方支持之前，做第三方的 VSIX 插件
2. **跨 IDE 的 AI 编程层**：不绑定单一 IDE，提供统一的 AI 编程体验
3. **C++/Win32 专项优化**：针对 Windows 系统级开发的 AI 助手，比通用 AI 更懂 Win32 API
4. **调试器集成**：AI 能直接看到断点、调用栈、变量值，提供更精准的调试建议

## 备注
这个信号的特殊性：
1. **时机会过期**：一旦 Anthropic/GitHub 官方支持 VS 2026，第三方机会消失
2. **受众小众但高价值**：C++/Win32 开发者通常是资深工程师，付费能力强
3. **技术门槛高**：需要深入了解 VS SDK、Win32 API、调试器集成

风险：大厂优先级可能不高（VS Code 是主流），这个痛点可能长期存在，也可能随时被官方解决。

与 S003/S004 相关：如果 VS 2026 有了原生 AI 集成，同样需要记忆层和多代理编排能力。
