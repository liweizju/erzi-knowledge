# MEMORY.md - 二子的长期记忆

*这是你的长期记忆。重要的事情记在这里，每隔几天整理一次。*

## 关于大子

- 技术能力强，macOS + Node.js 开发者
- 喜欢轻松高效的交流风格
- 主要用 Telegram 和二子互动

## 重要决策记录

- **2026-02-07：** OpenClaw 初始配置完成
  - 智谱GLM Coding Pro 套餐，使用专用 API 端点 (`/api/coding/paas/v4/`)
  - 主模型：zhipu/glm-4.7，图片模型：zhipu/glm-4.6v
  - DeepSeek Reasoner 作为备选
  - Telegram 为主要消息渠道
  - 启用了图片识别和语音转写（本地 whisper）
  - iMessage 已配置但禁用（测试不方便）
  - Feishu 已配置但禁用

## 经验教训

- 智谱国内平台 GLM Coding 套餐有独立的 API 端点，和普通 API 不同
- 图片功能需要同时在 `tools.deny`、`tools.media.image.enabled` 和 model input 三处都配置正确
- OpenClaw 重启命令是 `openclaw gateway restart`，不是 `openclaw restart`

## 系统能力

- **记忆搜索已启用**：本地 embedding (embeddinggemma-300M)，可语义搜索 memory/、knowledge/、MEMORY.md
- 会话记忆实验功能已开启，会话摘要也会被索引
- 心跳每小时 08:00-23:00，建站每天凌晨 02:00

## 待办/关注

- 定期检查智谱 Coding Pro 套餐余额和用量
- 定期整理 knowledge/ 目录，把精华提炼到这里
