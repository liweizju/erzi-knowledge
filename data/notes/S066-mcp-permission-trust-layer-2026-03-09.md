# S066 - MCP 信任与权限层：Agent 生态的“Cloudflare 时刻”

> **质量评分**：7.9/10（相关性 3.2/4 + 商业价值 2.4/3 + 新颖性 1.5/2 + 可落地性 0.8/1）
> **30秒结论**：MCP 正在成为 Agent 连接外部世界的事实标准，但“谁能调用什么、调用后泄露什么”仍高度裸奔。机会不在再做一个 Agent，而在做 Agent 之上的**权限代理 + 信任评分 + 安全扫描**基础设施。
> **影响对象**：AI Agent 平台团队、开发者工具创业者、高权限数据接入场景（代码库/数据库/内部知识库）
> **建议动作**：优先做 MCP 最小权限代理（可审计、可阻断、可回放）。
> **风险/不确定性**：平台方可能快速原生化权限控制，挤压独立工具空间。

---

## 核心观察

MCP 采用速度很快，但权限模型和信任体系仍处于“先连上再说”的阶段。
开发者社区开始从“能不能接入”转向“接入后如何不出事”，并出现了安全扫描、Guard、策略引擎等配套工具。

## 痛点证据（2+ 独立来源）

- **协议扩散速度**：HN 热帖“OpenAI adds MCP support to Agents SDK”获得 807 分 / 267 评论，显示 MCP 已从单点生态走向主流开发栈。  
  https://news.ycombinator.com/item?id=43485566

- **真实用户担忧（评论证据）**：同帖评论明确提出信任与权限问题：  
  - “How does a consumer of a remote MCP server trust that it is not saving/modifying their data?”  
  - “It’s pretty astounding … attaching MCPs that provide unfettered access …”  
  说明用户已从“功能可用”转向“权限边界可控”。

- **可复现风险案例**：研究披露 Supabase MCP 场景下，攻击者可借提示注入诱导高权限代理读取并外泄敏感表数据（service_role + 非可信输入同流）。  
  https://www.generalanalysis.com/blog/supabase-mcp-blog

- **市场自发补洞**：Cisco 开源 `skill-scanner`（2026-01 创建，已 1k+ stars），定位就是扫描 prompt injection、data exfiltration、恶意模式，且支持 CI/CD 接入。  
  https://github.com/cisco-ai-defense/skill-scanner

- **监管关注升温**：NIST 发布 AI Agent 安全征询（RFI），表明“Agent 安全”已进入政策层议程。  
  https://www.federalregister.gov/documents/2026/01/08/2026-00206/request-for-information-regarding-security-considerations-for-artificial-intelligence-agents

## 为什么现在

1. MCP 从“新协议”进入“默认接入层”，风险暴露面按接入数指数增长。  
2. 真实事故已出现，团队开始愿意为“防事故”付费。  
3. 监管和企业采购都在抬高安全门槛，权限可解释性会变成准入条件。

## 建议动作

1. **做 MCP Permission Proxy**：按 server/tool/action 维度做 allow/deny，默认最小权限。  
2. **加数据外泄防线**：对 SQL/tool 返回结果做敏感字段识别与脱敏，超策略直接阻断。  
3. **输出信任评分**：把签名、静态扫描、行为回放、调用审计汇总成“技能/服务可信分”。

## 风险与不确定性

- 平台原生权限治理若快速完善，第三方会被压到细分场景。  
- 安全工具误报率过高会伤害开发体验，影响续费。  
- 中小团队短期更看重速度，安全预算可能滞后。

## 来源

- [HN: OpenAI adds MCP support to Agents SDK](https://news.ycombinator.com/item?id=43485566)
- [General Analysis: Supabase MCP can leak your entire SQL database](https://www.generalanalysis.com/blog/supabase-mcp-blog)
- [GitHub: Cisco skill-scanner](https://github.com/cisco-ai-defense/skill-scanner)
- [Federal Register: NIST AI Agent security RFI](https://www.federalregister.gov/documents/2026/01/08/2026-00206/request-for-information-regarding-security-considerations-for-artificial-intelligence-agents)
