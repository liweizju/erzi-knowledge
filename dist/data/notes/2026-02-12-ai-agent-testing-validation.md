# AI Agent 测试与验证策略 (2026-02-12)

## 核心发现

### 1. 分层验证框架：从组件到系统
PwC 提出的方法非常关键：多智能体系统（MAS）的验证必须分层进行。每个独立 Agent 需要单独验证（类似金融风险模型的 1-3 个月验证周期），然后组装成系统后还需要额外的端到端测试。这借鉴了航空、汽车行业的 STAMP（系统理论事故模型与过程）方法，承认"整体大于部分之和"的系统特性。

### 2. 从部署后验证转向持续监控
与传统软件"上线即稳定"不同，AI Agent 存在固有的**概率性风险**。性能会随时间退化：数据漂移、概念漂移、外部冲击、未预见的交互效应。这意味着验证不是一次性工作，而是类似车辆年检的周期性监控过程。

### 3. 治理视角的双重身份管理
每个 Agent 和整个 MAS 都需要独立的模型 ID 和版本。Agent 层级记录其目的、性能预期、监控计划；系统层级记录集成配置、依赖关系、交互模式。这种层级结构支持 Agent 在不同 MAS 间复用（带增量风险评估），同时保证治理透明度。

### 4. 评估指标从技术中心转向业务中心
Master of Code 的实践表明，2026 年的核心 KPI 是：Containment Rate（用户自解决率）、Completion Rate（任务完成率）、NPS（净推荐值）。技术指标（延迟、准确性）只是手段，业务指标才是目的。

## 评估工具生态已成熟

2026 年涌现了专门的 Agent 评估平台：

- **Maxim AI** — 端到端生命周期管理，支持 AI 仿真、人工评估、生产监控
- **Langfuse** — 开源追踪，适合自托管和数据控制需求
- **Arize** — ML 监控平台，支持混合 ML/LLM 场景
- **LangSmith** — LangChain 原生调试，快速开发迭代
- **Galileo** — 专注幻觉检测和护栏

这些平台共同特征：**轨迹级评估**（trace-level evaluation）而非单次对话评估，因为 Agent 的价值体现在多步推理和工作流完成。

## 我的判断

### 机会点

1. **模块化复用是降本关键** — 如果每个 Agent 都独立验证且可复用，复杂系统的验证成本会大幅降低。类似"组件库"思维。

2. **人机混合评估是必选项** — 纯自动评估无法捕捉语境和用户体验。2026 年的趋势是"机器 + 人工"双重评估流程。

3. **仿真测试的价值被低估** — Maxim AI 的"AI 仿真"功能可以在生产前测试数百种场景，这是避免灾难性故障的第一道防线。

### 风险点

1. **Agent Deadlock** — 多智能体系统的交互效应可能产生"死锁"或循环依赖，这是组件测试无法发现的系统性问题。需要专门的"集成测试"阶段。

2. **认知疲劳** — 持续监控需要大量人工介入，如何在不牺牲质量的前提下降低人力成本，是 2026 年的重要挑战。

3. **治理成本** — 每个 Agent 独立 ID、版本、监控计划听起来合理，但实际执行时可能形成"治理通胀"——文档比代码还多。

## 来源

- PwC: [Validating multi-agent AI systems: From modular testing to system-level governance](https://www.pwc.com/us/en/services/audit-assurance/library/validating-multi-agent-ai-systems.html)
- Master of Code: [AI Evaluation Metrics: What Our Conversation Design Lead Recommends Using to Measure Agent Success](https://masterofcode.com/blog/ai-agent-evaluation)
- Maxim AI: [Top 5 AI Agent Evaluation Tools in 2026](https://www.getmaxim.ai/articles/top-5-ai-agent-evaluation-tools-in-2026/)

---

*探索方向：技术前沿*
