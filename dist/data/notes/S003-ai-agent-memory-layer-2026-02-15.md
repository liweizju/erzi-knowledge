# S003: AI Agent 记忆层

## 来源
Hacker News（Engram、Whisper 双帖子）、GitHub discussions

## 类型
开发者工具 / 基础设施信号

## 一句话
AI 编程助手（Claude Code、Cursor 等）每次新会话都"失忆"，开发者需要反复解释上下文，催生了本地优先的记忆层工具需求。

## 人群
- 重度使用 Claude Code/Cursor 的开发者
- 构建 AI Agent 应用的工程师
- 需要长期与 AI 协作的团队

## 痛点
1. **会话级失忆**：每次新会话 AI 忘记之前的一切，同样的错误重复犯
2. **上下文爆炸成本**：为了保持记忆，需要不断追加 context，token 成本失控
3. **跨会话协作断裂**：昨天讨论的架构决策，今天 AI 完全不知道
4. **个人偏好无法持久**：AI 不记得你喜欢的代码风格、技术栈选择

## 现有方案的不足
- Mem0/Letta/Zep 等方案需要云服务、API keys、复杂配置
- 大多数方案是 SaaS，数据不在自己控制之下
- 配置复杂：需要 Docker、Postgres、向量数据库

## 验证来源
- HN Engram 帖子：https://news.ycombinator.com/item?id=47008274（1 天前发布，开发者明确说 "AI agents have Alzheimer"）
- HN Whisper 帖子：https://news.ycombinator.com/item?id=46938705（1 周前发布，"they forget users, search the wrong docs, hallucinate, and get very expensive as context grows"）
- HN Context Engineering 讨论：https://news.ycombinator.com/item?id=45352901（开发者分享使用 .agent/ 目录管理上下文的实践）
- HN Ask HN 知识图谱讨论：https://news.ycombinator.com/item?id=43940654（开发者讨论 agent 记忆管理的挑战）
- HN Context is the bottleneck：https://news.ycombinator.com/item?id=45387374（讨论上下文是 coding agents 的瓶颈）
- GitHub Copilot SDK feature request：提到需要 "progressive workflow execution with checkpoints"

## 信号强度
🔴 强信号
- HN 一周内出现两个独立产品（Engram、Whisper）解决同一问题
- 多个讨论串都有开发者分享自己的上下文管理 hack
- 痛点表达非常直白："AI agents have Alzheimer"、"every time I started a new Claude Code session, it forgot everything"
- 开发者愿意自己造工具解决问题（Engram 作者自己先用了再发布）

## 原始链接
- Engram：https://engram-ai.dev / https://github.com/engram-memory/engram
- Whisper：https://usewhisper.dev

## 产品机会思考
1. **本地优先的记忆层**：SQLite + FTS5，零配置，数据不出本机（Engram 的方向）
2. **MCP 原生集成**：与 Claude Code、Cursor 等 MCP 客户端无缝集成
3. **记忆重要性排序**：不是所有记忆都同等重要，需要有 importance score 和 recall 机制
4. **团队共享记忆**：团队级别的知识库，新成员加入自动获得历史上下文
5. **多模态记忆**：不只是文本，还有代码片段、架构图、决策记录

## 备注
这个信号的典型特征是：开发者先自己 hack 解决方案，再产品化分享。Engram 作者用 .agent/ 目录 + auto-recall hook 解决自己的问题后，才做成开源产品。这说明痛点足够真实、足够痛。

现有方案（Mem0/Letta/Zep）的复杂度是机会点——本地优先、零配置、MCP 原生的方案有差异化空间。

与 S001（iOS 键盘）类似，都是基础体验的缺失，但这个信号是开发者工具，受众更聚焦，商业价值更直接。
