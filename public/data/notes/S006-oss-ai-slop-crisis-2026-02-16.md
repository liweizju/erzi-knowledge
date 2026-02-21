# S006: 开源项目 AI 生成贡献质量危机

## 来源
- GitHub Blog（2026-02-12）《Welcome to the Eternal September of open source》
- InfoWorld、The Register 等科技媒体持续报道
- curl、Ghostty、tldraw 等项目官方公告

## 类型
开发者工具 / 开源生态

## 一句话
生成式 AI 大幅降低了代码贡献门槛，导致开源维护者被低质量 AI 生成内容淹没，项目被迫关闭外部贡献通道。

## 人群
- 开源项目维护者（多为志愿者）
- 小型开源项目（无专职审核团队）
- 依赖开源库的企业开发者

## 痛点
1. **审核成本剧增**：AI 可以在几秒内生成 PR，但审核一个 PR 仍需数小时，成本不对等
2. **噪音淹没有效贡献**：curl 项目 AI 生成报告占比已达 20%，维护者被迫关停 bug bounty
3. **信任体系崩溃**：贡献者与维护者之间的信任关系被 AI 大规模生成内容破坏
4. **精神负担**：志愿者维护者在面对海量低质量贡献时产生倦怠

## 现有方案的不足
- **项目级限制**：Ghostty 等改为邀请制，但牺牲了开放性
- **人工审核**：无法应对规模化的 AI 生成内容
- **自动检测**：GitHub 尚未提供有效的 AI 内容检测工具
- **信任机制**：缺乏类似 Linux "web of trust" 的可扩展方案

## 验证来源
- https://github.blog/open-source/maintainers/welcome-to-the-eternal-september-of-open-source-heres-what-we-plan-to-do-for-maintainers/
- https://daniel.haxx.se/blog/2026/01/26/the-end-of-the-curl-bug-bounty/
- https://github.com/ghostty-org/ghostty/blob/main/CONTRIBUTING.md
- https://www.infoworld.com/article/4129056/is-ai-killing-open-source.html

## 信号强度
🔴 强信号

**理由**：
- GitHub 官方在 2 天前发布专门文章，说明问题已上升到平台战略层面
- 多个头部项目（curl、tldraw 等）已采取极端措施（关闭 bounty、限制 PR）
- 问题影响整个开源生态，不只是个别项目
- 时效性极强，2026 年 2 月集中爆发

## 原始链接
- GitHub Blog: https://github.blog/open-source/maintainers/welcome-to-the-eternal-september-of-open-source-heres-what-we-plan-to-do-for-maintainers/
- curl 公告: https://daniel.haxx.se/blog/2026/01/26/the-end-of-the-curl-bug-bounty/
- InfoWorld 分析: https://www.infoworld.com/article/4129056/is-ai-killing-open-source.html
