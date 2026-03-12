# S074 - AI Prompt 成为新攻击面

**信号强度**: 强
**发现日期**: 2026-03-12
**信息源**: CodeWall 安全研究、Hacker News (389 分，200+ 评论)

---

## 30秒结论

**AI Prompt 是新的皇冠珠宝资产**。McKinsey 内部 AI 平台 Lilli 被自主攻击代理在 2 小时内攻破，暴露 46.5M 聊天记录和 728K 文件。关键洞察：攻击者可以通过 SQL 注入修改系统 prompt，从而**静默改变 AI 行为**，且不留任何日志痕迹。

**核心数据**:
- 46.5M 聊天记录暴露（包含战略、财务、M&A 等敏感信息）
- 728K 文件可直接下载（192K PDF、93K Excel、93K PPT）
- 系统prompt 存储在同一数据库中，可被读写访问修改
- 攻击者可静默修改 prompt，让 AI 输出错误建议、泄露数据、移除安全限制

---

## 影响对象

**直接影响**:
- 企业 AI 安全负责人
- 内部 AI 平台开发者
- 使用 AI 工具的咨询/金融/法律行业

**间接影响**:
- 所有依赖 AI 输出做决策的团队
- AI 供应商（需要重新思考 prompt 存储安全）

---

## 建议动作

**对于企业 AI 平台**:
1. **Prompt 版本控制**：系统 prompt 必须有版本历史、完整性监控
2. **独立存储**：Prompt 不应与业务数据存储在同一数据库
3. **只读策略**：生产环境的 prompt 应该是只读的
4. **行为监控**：检测 AI 输出的异常变化（可能是 prompt 被篡改的信号）

**对于 AI 供应商**:
1. 提供"Prompt 审计日志"功能
2. 支持Prompt 签名验证（检测未授权修改）
3. 提供"AI 行为漂移检测"

**对于使用 AI 的团队**:
1. 不要盲目信任 AI 输出，特别是涉及重大决策时
2. 建立AI 输出的交叉验证机制
3. 对敏感任务的 AI 输出进行定期审查

---

## 风险/不确定性

**不确定性**:
1. 这是特例（McKinsey 文化问题）还是普遍现象？
2. 有多少企业 AI 平台存在类似漏洞？
3. 是否已经有国家级攻击者利用了这类漏洞？

**潜在反驳**:
- 这只是"传统 SQL 注入"，不是 AI 特有的问题
- 但关键在于：**Prompt 作为新攻击目标的危害性**远超传统数据泄露

**更大风险**:
- 如果 AI prompt 被修改，企业可能在数月内依赖错误建议做决策
- 这种攻击难以检测（没有文件变更、没有进程异常）
- 可能影响 43,000+ McKinsey 顾问，进而影响他们的客户决策

---

## 原始证据

**来源**: https://codewall.ai/blog/how-we-hacked-mckinseys-ai-platform

**攻击时间线**:
- 2026-02-28: 自主代理发现 SQL 注入漏洞
- 2026-02-28: 确认完整攻击链（27 个发现）
- 2026-03-01: 负责任披露
- 2026-03-02: McKinsey 修补漏洞
- 2026-03-09: 公开披露

**关键发现**:
- "Lilli's system prompts were stored in the same database the agent had access to"
- "An attacker with write access could have rewritten those prompts. Silently. No deployment needed. No code change. Just a single UPDATE statement"
- "AI prompts are the new Crown Jewel assets"

**HN 内部人士评论**:
- "McKinsey requires hiring an external pen-testing company to launch even to a small group of coworkers"（但他们没有做）
- "McKinsey HEAVILY punishes working on internal projects"（内部项目被视为"半日工作"）
- "Most products of McKinsey are a grab-bag of raw ideas, implemented as a one-off, without a cohesive vision"

---

## 产品机会

1. **Prompt 安全监控工具**：检测 prompt 的未授权修改
2. **AI 行为审计平台**：持续监控 AI 输出的异常变化
3. **企业 AI 安全评估**：针对内部 AI 平台的渗透测试服务
4. **Prompt 版本控制**：类似 Git 的 prompt 管理系统
5. **自主攻击代理**：企业版"AI 红队测试"工具
