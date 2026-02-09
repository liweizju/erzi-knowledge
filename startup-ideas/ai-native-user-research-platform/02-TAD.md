# 技术架构文档（TAD）- 灵犀调研（InsightFlow AI）

**版本：** v1.0
**状态：** 设计阶段
**创建日期：** 2026-02-09
**负责人：** 二子

---

## 文档变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-02-09 | 初始版本 | 二子 |

---

## 一、技术架构概述

### 1.1 架构目标

- **性能：** API 响应 < 500 ms，对话响应 < 3 秒
- **可扩展：** 支持 1000+ 并发用户
- **可靠性：** 系统可用性 > 99.5%
- **安全：** 数据加密，权限控制，合规审计
- **成本：** 智谱 API 成本 < ¥10K/月（100 用户）

---

### 1.2 技术选型原则

- **中文优先：** 选择对中文支持好的技术栈
- **本地部署：** 核心功能支持本地部署（数据隐私）
- **成熟稳定：** 使用成熟的开源技术和云服务
- **成本可控：** 优先选择成本低的方案
- **易于维护：** 代码清晰，文档完善

---

## 二、技术栈

### 2.1 AI 层

#### 2.1.1 对话引擎（GLM-4.7）

**选择理由：**
- 中文能力强，适合用户访谈场景
- 成本低，比 OpenAI GPT-4 便宜 80%
- 国内 API，延迟低（< 200 ms）
- 支持本地部署（可选）

**技术规格：**
- **模型：** 智谱 GLM-4.7
- **API 端点：** `/api/coding/paas/v4/chat/completions`
- **上下文窗口：** 128K tokens
- **最大输出：** 4096 tokens/次
- **定价：** 约 ¥0.01/1K tokens
- **限制：** 100 RPM（每分钟请求）

**备选方案：**
1. 通义千问 Qwen-Max（阿里云）
2. 文心一言 ERNIE-Bot 4.0（百度）
3. DeepSeek V3（成本更低）

---

#### 2.1.2 语音识别（Whisper）

**选择理由：**
- 开源免费
- 中文识别准确率高（> 95%）
- 支持本地部署（数据隐私）
- 社区活跃，文档完善

**技术规格：**
- **模型：** OpenAI Whisper
- **本地部署：** Hugging Face `openai/whisper-base` 或 `small`
- **推理引擎：** PyTorch + ONNX Runtime（加速）
- **性能：**
  - base 模型：~1s/10s 音频
  - small 模型：~2s/10s 音频
- **硬件要求：**
  - CPU：4 核心
  - 内存：8GB+
  - GPU：可选（NVIDIA RTX 3060+）

**备选方案：**
1. 阿里云语音识别（云服务）
2. 腾讯云语音识别（云服务）
3. 讯飞语音识别（中文优化）

---

#### 2.1.3 语音合成（TTS）

**选择理由：**
- 自然度高，接近真人
- 中文发音标准
- 价格合理
- 易于集成

**技术选型：**
- **首选：** 阿里云语音合成
  - 模型：`zhixiaobiao`（男声）/`xiaomeng`（女声）
  - 价格：¥0.016/千字符
  - 延迟：< 500 ms
  
- **备选：** Azure Speech
  - 模型：`zh-CN-XiaoxiaoNeural`
  - 价格：$16/百万字符
  - 延迟：< 300 ms

---

### 2.2 应用层

#### 2.2.1 前端（Vue 3）

**技术栈：**
- **框架：** Vue 3 + Composition API
- **构建工具：** Vite
- **UI 框架：** Element Plus 或 Ant Design Vue
- **状态管理：** Pinia
- **路由：** Vue Router
- **HTTP 客户端：** Axios
- **实时通信：** Socket.IO（语音访谈）

**选择理由：**
- 和 erzi-knowledge 技术栈一致（复用经验）
- Vue 3 性能好，生态成熟
- Element Plus 组件丰富，开箱即用
- 国内开发者社区活跃

**关键功能：**
- 访谈对话界面（文本/语音）
- 实时数据可视化（D3.js 或 ECharts）
- 拖拽式配置（Vue Draggable）
- 响应式设计（移动端支持）

---

#### 2.2.2 后端（Node.js）

**技术栈：**
- **运行时：** Node.js v20+
- **框架：** Express.js
- **ORM：** Prisma（类型安全）
- **验证：** Zod
- **日志：** Winston
- **任务队列：** BullMQ（基于 Redis）
- **实时通信：** Socket.IO

**选择理由：**
- JavaScript 全栈，减少技术栈复杂度
- 异步非阻塞，适合高并发
- 生态成熟，库丰富
- 前端后端代码复用（TypeScript）

**关键功能：**
- RESTful API 设计
- WebSocket 通信（实时对话）
- 任务队列处理（异步分析）
- 认证和授权（JWT + RBAC）

---

### 2.3 数据层

#### 2.3.1 关系型数据库（PostgreSQL）

**使用场景：**
- 用户账户
- 研究项目
- 参与者信息
- 权限管理
- 审计日志

**技术规格：**
- **版本：** PostgreSQL 15+
- **扩展：** pgvector（向量搜索）
- **连接池：** PgBouncer
- **备份：** 每日备份 + WAL 归档

**数据模型（核心表）：**
```sql
-- 用户
users (id, email, password_hash, name, role, created_at, updated_at)

-- 研究项目
projects (id, user_id, name, description, status, config_json, created_at, updated_at)

-- 访谈
interviews (id, project_id, participant_id, status, messages_jsonb, transcript, created_at, completed_at)

-- 参与者
participants (id, email, name, attributes_jsonb, quality_score, created_at)

-- 报告
reports (id, project_id, summary_jsonb, themes_jsonb, sentiments_jsonb, created_at)

-- 审计日志
audit_logs (id, user_id, action, resource, metadata_jsonb, created_at)
```

---

#### 2.3.2 文档数据库（MongoDB）

**使用场景：**
- 访谈消息
- 转录稿（长文本）
- 分析结果（非结构化）
- 缓存数据

**技术规格：**
- **版本：** MongoDB 6.0+
- **存储引擎：** WiredTiger
- **索引：** 复合索引优化查询
- **分片：** 水平扩展支持

**数据模型（核心集合）：**
```javascript
// 访谈消息
{
  _id: ObjectId,
  interview_id: ObjectId,
  messages: [
    {
      id: String,
      role: 'ai' | 'user',
      content: String,
      timestamp: Date,
      audio_url: String,  // 可选
      sentiment: Number  // 情感评分
    }
  ]
}

// 转录稿
{
  _id: ObjectId,
  interview_id: ObjectId,
  raw_transcript: String,
  clean_transcript: String,
  segments: [
    {
      start: Number,
      end: Number,
      text: String,
      speaker: 'ai' | 'user'
    }
  ]
}

// 分析结果
{
  _id: ObjectId,
  interview_id: ObjectId,
  themes: [
    {
      id: String,
      name: String,
      weight: Number,
      quotes: [String]
    }
  ],
  sentiments: {
    overall: Number,
    trend: [Number]  // 时间序列
  },
  insights: [
    {
      type: 'pain_point' | 'suggestion' | 'expectation',
      content: String,
      importance: Number
    }
  ]
}
```

---

#### 2.3.3 缓存（Redis）

**使用场景：**
- 会话缓存
- API 响应缓存
- 任务队列
- 限流

**技术规格：**
- **版本：** Redis 7.0+
- **持久化：** AOF + RDB
- **集群：** Redis Cluster（高可用）

**缓存策略：**
```
TTL 配置：
- 会话缓存：1 小时
- API 响应缓存：10 分钟
- 用户配置：30 分钟
- 参与者数据：24 小时
```

---

### 2.4 基础设施

#### 2.4.1 云服务

**云厂商选择：**
- **首选：** 腾讯云
  - 优势：国内稳定，GLM-4.7 API 延迟低
  - 服务：CVM、COS、CLB、PostgreSQL
  
- **备选：** 阿里云
  - 优势：产品丰富，价格竞争力强
  - 服务：ECS、OSS、SLB、PolarDB

**资源规划（第一年）：**
| 资源 | 配置 | 数量 | 月成本 |
|------|------|------|--------|
| 应用服务器 | 4C8G | 2 台 | ¥800 |
| 数据库服务器 | 8C16G | 2 台 | ¥1,600 |
| Whisper GPU 服务器 | RTX 4060 12GB | 1 台 | ¥2,000 |
| 对象存储 | 500GB | 1 TB/月 | ¥500 |
| 负载均衡 | CLB | 1 个 | ¥300 |
| CDN | 1TB 流量 | - | ¥200 |
- **合计：** 约 ¥5,400/月

---

#### 2.4.2 DevOps

**CI/CD：**
- **代码托管：** GitHub（私有仓库）
- **CI 平台：** GitHub Actions
- **CD 平台：** 腾讯云 TKE（Kubernetes）
- **镜像仓库：** 腾讯云 TCR

**部署流程：**
```
1. 开发者 push 代码到 GitHub
2. GitHub Actions 自动触发 CI
3. 运行测试（单元测试 + 集成测试）
4. 构建 Docker 镜像
5. 推送到 TCR
6. 更新 Kubernetes 配置
7. 自动部署到 staging
8. 人工验证后部署到 production
```

**监控：**
- **应用监控：** Sentry（错误追踪）
- **性能监控：** Prometheus + Grafana
- **日志管理：** ELK Stack（Elasticsearch + Logstash + Kibana）
- **APM：** New Relic 或 Datadog

---

## 三、系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面层（Vue 3）                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ 研究员   │  │ 参与者   │  │ 管理员   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      API 网关层                            │
│  ┌───────────────────────────────────────────────────┐      │
│  │ 负载均衡（CLB）                            │      │
│  │ 限流 + 认证 + 路由                          │      │
│  └───────────────────────────────────────────────────┘      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    应用服务层（Node.js）                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 用户服务  │  │ 访谈服务  │  │ 分析服务  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 招募服务  │  │ 报告服务  │  │ 任务服务  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     业务逻辑层                              │
│  ┌───────────────────────────────────────────────────┐      │
│  │ 工作流引擎（BullMQ）                       │      │
│  │ - 访谈对话流                                  │      │
│  │ - 语音转录队列                                │      │
│  │ - 分析任务队列                                │      │
│  └───────────────────────────────────────────────────┘      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      AI 服务层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │GLM-4.7   │  │ Whisper  │  │ TTS      │          │
│  │对话引擎   │  │语音识别   │  │语音合成   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                               │
│  备选：通义千问、文心一言、Azure Speech            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      数据层                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │PostgreSQL│  │ MongoDB  │  │ Redis    │          │
│  │关系数据   │  │文档数据   │  │缓存      │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                               │
│  ┌──────────┐  ┌──────────┐                        │
│  │ COS/OSS  │  │ CDN      │                        │
│  │对象存储   │  │加速分发   │                        │
│  └──────────┘  └──────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.2 核心服务架构

#### 3.2.1 访谈服务（核心）

**职责：**
- 管理 AI 对话
- 处理用户输入（文本/语音）
- 调用 GLM-4.7 API
- 生成动态追问
- 维护对话上下文

**技术实现：**
```typescript
// 访谈服务伪代码
class InterviewService {
  async handleMessage(message: Message) {
    // 1. 保存消息
    await this.saveMessage(message);
    
    // 2. 判断是否需要追问
    const shouldFollowUp = this.shouldFollowUp(message);
    
    // 3. 生成 AI 响应
    if (shouldFollowUp || message.isLast) {
      const response = await this.callGLM(message, this.context);
      
      // 4. 保存 AI 响应
      await this.saveMessage(response);
      
      // 5. 推送给用户
      await this.pushToUser(response);
      
      // 6. 异步分析情感
      await this.analyzeSentiment(response);
    }
  }
  
  shouldFollowUp(message: Message): boolean {
    // 回答长度 < 20 字
    // 包含关键词（"因为"、"但是"、"其实"）
    // 情感突然变化
    return (message.content.length < 20) ||
           this.hasKeyword(message) ||
           this.hasEmotionShift(message);
  }
  
  async callGLM(message: Message, context: Context): Promise<Response> {
    const systemPrompt = this.buildSystemPrompt(context.interviewConfig);
    const messages = this.buildMessages(context, message);
    
    const response = await glm4.chat.completions.create({
      model: 'glm-4.7',
      messages: messages,
      system: systemPrompt,
      temperature: 0.7,
      max_tokens: 2048
    });
    
    return response;
  }
}
```

---

#### 3.2.2 语音服务（核心）

**职责：**
- 接收语音上传
- 调用 Whisper 转录
- 返回文本结果
- 生成语音响应（TTS）

**技术实现：**
```typescript
// 语音服务伪代码
class VoiceService {
  async transcribe(audioFile: File): Promise<string> {
    // 1. 上传到对象存储
    const audioUrl = await this.uploadToCOS(audioFile);
    
    // 2. 调用 Whisper（本地）
    const transcript = await this.callWhisper(audioUrl);
    
    // 3. 清理文本
    const cleanText = this.cleanTranscript(transcript);
    
    // 4. 保存转录稿
    await this.saveTranscript(audioFile.interviewId, cleanText);
    
    return cleanText;
  }
  
  async callWhisper(audioUrl: string): Promise<string> {
    // 调用本地 Whisper 服务
    const response = await fetch('http://whisper-service/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audio_url: audioUrl })
    });
    
    return response.text;
  }
  
  async synthesize(text: string): Promise<string> {
    // 1. 调用 TTS API（阿里云）
    const audioUrl = await aliyun.tts({
      text: text,
      voice: 'zhixiaobiao',
      format: 'mp3',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    });
    
    // 2. 上传到对象存储
    const storedUrl = await this.uploadToCOS(audioUrl);
    
    return storedUrl;
  }
}
```

**Whisper 服务（独立部署）：**
```python
# whisper_service.py
from fastapi import FastAPI, UploadFile
from whisper import load_model
import torch

app = FastAPI()
model = load_model("small", device="cuda")  # GPU 加速

@app.post("/transcribe")
async def transcribe(audio_url: str):
    # 1. 下载音频
    audio = download_audio(audio_url)
    
    # 2. 转录
    result = model.transcribe(
        audio,
        language="zh",
        task="transcribe"
    )
    
    # 3. 返回文本
    return {"text": result["text"]}
```

---

#### 3.2.3 分析服务（核心）

**职责：**
- 主题提取（NLP）
- 情感分析
- 关键引言提取
- 报告生成

**技术实现：**
```typescript
// 分析服务伪代码
class AnalysisService {
  async extractThemes(transcript: string): Promise<Theme[]> {
    // 1. 调用 GLM-4.7 提取主题
    const response = await glm4.chat.completions.create({
      model: 'glm-4.7',
      messages: [{
        role: 'system',
        content: '你是一个用户研究专家。从访谈转录稿中提取主要主题，每个主题包含：名称、权重（0-1）、代表性引言。'
      }, {
        role: 'user',
        content: `从以下访谈中提取主题：\n\n${transcript}`
      }],
      temperature: 0.3,  // 低温度，更确定
      max_tokens: 2048
    });
    
    // 2. 解析 JSON 响应
    const themes = JSON.parse(response.choices[0].message.content);
    
    return themes;
  }
  
  async analyzeSentiment(text: string): Promise<number> {
    // 调用 GLM-4.7 情感分析
    const response = await glm4.chat.completions.create({
      model: 'glm-4.7',
      messages: [{
        role: 'system',
        content: '你是一个情感分析专家。分析文本的情感，返回 0-1 的分数，0 表示消极，1 表示积极。'
      }, {
        role: 'user',
        content: `分析以下文本的情感：\n\n${text}`
      }],
      temperature: 0.1,
      max_tokens: 50
    });
    
    return parseFloat(response.choices[0].message.content);
  }
  
  async generateReport(interview: Interview): Promise<Report> {
    // 1. 提取主题
    const themes = await this.extractThemes(interview.transcript);
    
    // 2. 分析情感
    const sentiments = await Promise.all(
      interview.messages.map(m => this.analyzeSentiment(m.content))
    );
    
    // 3. 提取关键引言
    const quotes = this.extractKeyQuotes(interview.messages);
    
    // 4. 生成报告
    const report = {
      summary: await this.generateSummary(interview),
      themes: themes,
      sentiments: {
        overall: this.calculateOverall(sentiments),
        trend: sentiments
      },
      quotes: quotes,
      recommendations: await this.generateRecommendations(interview)
    };
    
    return report;
  }
}
```

---

#### 3.2.4 招募服务

**职责：**
- 生成邀请码
- 验证参与者资格
- 管理参与者库
- 防欺诈检测

**技术实现：**
```typescript
class RecruitmentService {
  async generateInviteCode(projectId: string): Promise<string> {
    // 生成唯一邀请码（UUID）
    const code = uuidv4();
    
    // 保存到数据库
    await db.invite_codes.create({
      project_id: projectId,
      code: code,
      used: false,
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000  // 7 天
    });
    
    return code;
  }
  
  async validateParticipant(
    inviteCode: string,
    answers: Answer[]
  ): Promise<ValidationResult> {
    // 1. 验证邀请码
    const invite = await db.invite_codes.findOne({ code: inviteCode });
    if (!invite || invite.used) {
      throw new Error('Invalid invite code');
    }
    
    // 2. AI 筛选
    const quality = await this.screeningAI(answers);
    if (quality.score < 0.5) {
      throw new Error('Participant does not qualify');
    }
    
    // 3. 防欺诈检测
    const isFraud = await this.detectFraud(answers);
    if (isFraud) {
      await this.blockParticipant(invite.participant_id);
      throw new Error('Fraud detected');
    }
    
    return { valid: true, quality: quality.score };
  }
  
  async detectFraud(answers: Answer[]): Promise<boolean> {
    // 1. 检测回答速度（过快 = 机器人）
    const totalTime = this.calculateTotalTime(answers);
    if (totalTime < 30) {  // < 30 秒
      return true;
    }
    
    // 2. 检测一致性（前后矛盾）
    const inconsistency = this.checkConsistency(answers);
    if (inconsistency > 0.7) {
      return true;
    }
    
    // 3. 检测抄袭（复制粘贴）
    const plagiarism = this.checkPlagiarism(answers);
    if (plagiarism > 0.8) {
      return true;
    }
    
    return false;
  }
}
```

---

### 3.3 数据流架构

#### 3.3.1 访谈数据流

```
用户输入（文本/语音）
    ↓
前端上传（Vue）
    ↓
API 网关（认证、限流）
    ↓
访谈服务（Node.js）
    ↓
├─ 文本：直接处理
└─ 语音 → 语音服务 → Whisper 转录
    ↓
保存到 MongoDB（消息 + 转录稿）
    ↓
调用 GLM-4.7 生成响应
    ↓
保存 AI 响应
    ↓
推送到前端（WebSocket）
    ↓
异步分析服务
    ├─ 情感分析
    ├─ 主题提取
    └─ 生成报告
```

---

#### 3.3.2 报告生成数据流

```
访谈完成
    ↓
触发 BullMQ 任务
    ↓
分析服务接收任务
    ↓
├─ 提取主题（GLM-4.7）
├─ 分析情感（GLM-4.7）
├─ 提取引言（正则 + NLP）
└─ 生成摘要（GLM-4.7）
    ↓
保存到 MongoDB（报告）
    ↓
通知用户（WebSocket）
    ↓
用户查看报告
```

---

## 四、性能优化

### 4.1 缓存策略

| 数据类型 | 缓存位置 | TTL | 失效策略 |
|----------|----------|-----|----------|
| 用户会话 | Redis | 1 小时 | 主动失效 |
| API 响应 | Redis | 10 分钟 | 数据变更 |
| 参与者数据 | Redis | 24 小时 | 手动失效 |
| GLM 响应 | Redis | 7 天 | 参数变化 |
| Whisper 转录 | COS | 永久 | 手动删除 |

---

### 4.2 数据库优化

**PostgreSQL：**
- 索引优化（复合索引、部分索引）
- 连接池（PgBouncer）
- 读写分离（主从复制）
- 分区表（按时间分区）

**MongoDB：**
- 索引优化（单字段、复合索引、文本索引）
- 分片（水平扩展）
- TTL 索引（自动清理旧数据）

---

### 4.3 API 优化

- **批量请求：** 支持批量查询
- **分页：** 所有列表接口支持分页
- **字段过滤：** 只返回需要的字段
- **压缩：** Gzip 压缩响应
- **CDN 加速：** 静态资源 CDN 分发

---

## 五、安全架构

### 5.1 认证和授权

**认证：**
- JWT Token（无状态认证）
- Refresh Token（自动刷新）
- 2FA 支持（TOTP）

**授权：**
- RBAC（基于角色的访问控制）
- 权限粒度（项目级别、功能级别）
- 数据隔离（用户只能访问自己的数据）

---

### 5.2 数据加密

- **传输加密：** TLS 1.3（HTTPS）
- **存储加密：** AES-256（数据库字段加密）
- **密钥管理：** AWS KMS 或 阿里云 KMS

---

### 5.3 数据隐私

- **数据脱敏：** 敏感信息（手机号、邮箱）脱敏存储
- **数据隔离：** 不同用户数据物理隔离
- **数据保留：** 用户可删除数据（GDPR 合规）
- **审计日志：** 所有数据访问记录

---

### 5.4 安全措施

- **SQL 注入防护：** ORM（Prisma）
- **XSS 防护：** 输入验证 + 输出编码
- **CSRF 防护：** CSRF Token
- **限流：** API 限流（100 RPM/用户）
- **DDoS 防护：** 云厂商 DDS 服务

---

## 六、监控和运维

### 6.1 监控指标

| 类别 | 指标 | 阈值 |
|------|------|------|
| 性能 | API 响应时间 | < 500 ms |
| 性能 | 数据库查询时间 | < 100 ms |
| 可用性 | 系统可用性 | > 99.5% |
| 错误 | 错误率 | < 0.1% |
| 业务 | 访谈完成率 | > 70% |
| 成本 | GLM API 成本 | < ¥10K/月 |

---

### 6.2 告警规则

- API 响应时间 > 1 秒（P99）
- 错误率 > 1%
- 数据库连接失败 > 5 次/分钟
- Whisper 服务不可用
- GLM API 失败率 > 5%

---

### 6.3 备份策略

**数据库备份：**
- PostgreSQL：每日全量备份 + WAL 归档
- MongoDB：每日快照备份
- 保留周期：30 天

**文件备份：**
- 对象存储：启用版本控制
- 代码仓库：GitHub 自动备份

---

## 七、成本估算

### 7.1 第一年成本（100 用户）

| 类别 | 项目 | 月成本 | 年成本 |
|------|------|--------|--------|
| 云服务 | 服务器 + 数据库 | ¥5,400 | ¥64,800 |
| AI 服务 | GLM-4.7 API | ¥10,000 | ¥120,000 |
| AI 服务 | TTS（阿里云） | ¥500 | ¥6,000 |
| 监控 | Sentry + New Relic | ¥500 | ¥6,000 |
| 域名 + SSL | - | ¥100 | ¥1,200 |
| 其他 | 杂项 | ¥500 | ¥6,000 |
| **合计** | | **¥17,000** | **¥204,000** |

**备注：**
- GLM-4.7 成本假设：100 用户 × 100 访谈/月 × ¥1/访谈
- TTS 成本假设：20% 访谈使用语音 × ¥0.016/千字符

---

### 7.2 成本优化策略

1. **GLM-4.7 优化：**
   - 使用模型回退（简单问题用 GLM-4-Air）
   - 缓存重复查询
   - 压缩上下文

2. **Whisper 优化：**
   - 使用更小的模型（base）
   - 批量处理
   - 本地部署（避免云服务费用）

3. **基础设施优化：**
   - 使用 Spot 实例（节省 70%）
   - 自动扩缩容（按需付费）
   - 资源共享（多租户）

---

## 八、风险评估

### 8.1 技术风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| GLM-4.7 能力不足 | 中 | 高 | 多模型备选，持续测试 |
| Whisper 本地部署困难 | 低 | 中 | 云服务备选 |
| 高并发性能瓶颈 | 中 | 高 | 水平扩展，缓存优化 |
| 数据泄露 | 低 | 高 | 加密存储，权限控制 |

---

### 8.2 运维风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 单点故障 | 中 | 高 | 高可用架构（主从、多可用区） |
| DDoS 攻击 | 低 | 中 | 云厂商 DDS 服务 |
| 数据丢失 | 低 | 高 | 多重备份（本地 + 云 + 异地） |

---

## 九、技术债务

### 9.1 已知技术债务

- [ ] 暂时使用单体架构，后续拆分微服务
- [ ] 暂时使用 Redis 缓存，后续引入分布式缓存
- [ ] 暂时使用手动部署，后续完善 CI/CD
- [ ] 暂时没有完善的监控，后续补充

---

### 9.2 技术债务计划

| 债务 | 计划时间 | 优先级 |
|------|----------|--------|
| 微服务拆分 | 6-12 个月 | P2 |
| 分布式缓存 | 3-6 个月 | P2 |
| 完善监控 | 1-3 个月 | P1 |
| 自动化测试 | 1-3 个月 | P1 |

---

## 十、下一步

### 10.1 技术验证（第一周）

- [ ] GLM-4.7 API 测试（性能、质量）
- [ ] Whisper 本地部署测试
- [ ] 前端原型开发（Vue 3）
- [ ] 后端 API 开发（Express）

### 10.2 MVP 开发（第一个月）

- [ ] 访谈服务开发
- [ ] 语音服务开发
- [ ] 分析服务开发
- [ ] 招募服务开发

### 10.3 部署上线（第二个月）

- [ ] 云服务器采购
- [ ] 环境搭建
- [ ] CI/CD 配置
- [ ] 监控部署

---

*文档负责人：二子*
*最后更新：2026-02-09*
