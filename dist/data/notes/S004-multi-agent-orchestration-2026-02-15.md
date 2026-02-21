# S004: 多代理工作流编排

## 来源
GitHub Community Discussion（Copilot SDK feature request）、HN 多个讨论

## 类型
开发者工具 / 基础设施信号

## 一句话
开发者希望 AI 编程助手能自主完成多步骤任务（研究→规划→实现→验证），而不是每个步骤都需要人工介入。

## 人群
- 使用 AI 编程助手的开发者
- 需要处理复杂代码库的团队
- 构建 AI Agent 工具的创业者

## 痛点
1. **单会话架构限制**：当前 AI 编程助手是单 agent、单模型，无法分解任务
2. **无代理委托能力**：主 agent 不能派生子 agent 处理子任务
3. **静态模型选择**：会话开始时选模型，中途不能根据任务复杂度切换
4. **工具生态有限**：只有 defineTool()，缺少开箱即用的文件操作、git、测试等工具

## 现有方案的不足
- GitHub Copilot SDK 只提供会话级对话，无工作流编排能力
- Claude Code/Cursor 同样是单 agent 架构
- 开发者需要自己用 LangGraph/AutoGen 等框架搭建多代理系统，门槛高

## 验证来源
- GitHub Copilot SDK Feature Request：https://github.com/orgs/community/discussions/185990（2026-01-30，详细描述了多代理工作流的需求，包括任务分解、代理委托、动态模型路由等）
- HN Engram 讨论：https://news.ycombinator.com/item?id=47008274（评论区提到多代理协调问题）
- HN Context Engineering：https://news.ycombinator.com/item?id=45352901（讨论如何管理多步骤任务的上下文）
- GitHub agent-kit issue：https://github.com/inngest/agent-kit/issues/159（请求可定制的 agent 停止条件）
- GitHub vercel/ai issue：https://github.com/vercel/ai/issues/11434（请求 needsApproval 支持）

## 信号强度
🟡 中等信号
- GitHub discussion 的 feature request 非常详细，说明需求成熟
- 但这是"能力增强"而非"从无到有"的需求
- 现有工具（LangGraph、AutoGen、CrewAI）已经能解决部分问题
- 更多是 SDK 厂商（GitHub、Anthropic）的产品方向问题，而非创业机会

## 原始链接
- GitHub Feature Request：https://github.com/orgs/community/discussions/185990

## 产品机会思考
1. **多代理编排 SDK**：为现有 AI 编程助手提供多代理层，不需要等待官方支持
2. **工作流模板市场**：提供预定义的多步骤工作流（code review workflow、feature implementation workflow）
3. **成本优化层**：根据任务复杂度自动路由到合适的模型（简单任务用 Haiku，复杂用 Opus）
4. **可视化管理界面**：多代理任务的调试、监控、回滚界面
5. **团队协作层**：多人在多代理工作流中的协调

## 备注
这个信号的挑战在于：大厂（GitHub、Anthropic、OpenAI）很可能自己会做。机会点在于：
1. 做跨平台的编排层（不绑定单一 AI 提供商）
2. 做垂直场景的工作流模板（如 code review、安全审计、性能优化）
3. 做"最后一公里"的集成，让开发者的现有工具具备多代理能力

与 S003（AI Agent 记忆层）相关：记忆是单代理问题，编排是多代理问题。两者结合才是完整的 AI 编程助手体验。
