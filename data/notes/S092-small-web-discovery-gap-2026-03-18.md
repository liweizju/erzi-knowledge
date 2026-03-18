# S092 - Small Web 发现工具缺口

> **质量评分**：8.5/10（相关性 3.5/4 + 商业价值 2.5/3 + 新颖性 2.0/2 + 可落地性 0.5/1）
> **30秒结论**：Kagi Small Web 证明用户渴望"小网站发现"，但其定义（必须有 RSS、7 天内更新）排除了真正的小网站——专家网站、单功能网站、neocities、web experiments。机会：做真正的 Small Web 发现工具。
> **影响对象**：独立开发者、内容创作者、怀旧互联网用户
> **建议动作**：构建一个收录专家网站、neocities、单功能网站的发现工具，支持 shuffle 随机浏览
> **风险/不确定性**：小网站内容质量参差不齐，需要人工筛选或社区治理机制

---

## 核心观察

Kagi Small Web 在 HN 获得 701 pts、195 条评论，证明用户对"发现小网站"有强烈需求。但大量评论指出：Kagi 的定义太窄（必须有 RSS feed、7 天内更新），排除了真正的小网站。

用户想要的是：
- 专家网站（如 Sheldon Brown 自行车维修站、Ask Aaron 机器人 FAQ）
- 单功能网站（如 howmanypeopleareinspacerightnow.com）
- neocities 个人网站
- web experiments / demos

但这些都不符合 Kagi 的"博客 + RSS"标准。

## 痛点证据（2+ 独立来源）

- **来源 1：Hacker News 讨论（701 pts, 195 comments）**
  - 用户 hamdingers："Kagi 的 'Small Web' 定义太窄，必须是博客或 webcomic，必须有 RSS，必须有最近更新。这排除了太多有趣的东西。"
  - 用户 wiether："他们的规则排除了 Sheldon Brown 这样的绝对宝藏网站。每次这个话题出现，我试几个随机链接，从来没发现有趣的。"
  - 用户 hamdingers："专家/作者网站是 Small Web 的巅峰。但现在这类信息要么在广告泛滥的托管 wiki，要么锁在不可搜索的 Discord 里。"

- **来源 2：Kagi 官方页面**
  - 确认限制：只收录"过去 7 天内有更新"的博客，必须有 RSS feed
  - 用户举例的被排除网站：Sheldon Brown（自行车维修专家站，作者 2008 年去世）、Ask Aaron（机器人 FAQ）、howmanypeopleareinspacerightnow.com（单功能网站）

## 为什么现在

1. **用户对算法推荐疲劳**：Twitter/X、TikTok、YouTube 的算法推荐让人疲惫，用户渴望"发现真正的人"
2. **SEO 垃圾内容泛滥**：搜索结果被 SEO 优化的垃圾内容淹没，用户怀念"手工制作"的网站
3. **Discord 封锁知识**：大量知识被锁在不可搜索的 Discord 服务器里，用户想要开放的 web
4. **Kagi 证明需求存在**：Small Web 功能高热度（701 pts），但用户对其定义不满 = 产品机会

## 建议动作

1. **今天就能做**：用 GitHub Pages + 手工收录 50-100 个"真正的 Small Web"网站，做一个简单的随机跳转工具
2. **1 周内可做**：添加社区提交功能，让用户推荐网站，用 GitHub Issues 作为后端
3. **长期动作**：开发自动化发现机制（扫描 neocities、glitch、repl.it 等），结合社区筛选

## 风险与不确定性

- **内容质量控制**：小网站质量参差不齐，可能包含低质量或过时内容
- **可持续性**：手工筛选需要时间投入，社区治理可能产生分歧
- **商业模式**：不清楚这类工具如何盈利（订阅？捐赠？广告？）
- **技术门槛低**：容易复制，难以建立护城河

## 资本共识（可选）

- 无直接 VC 投资信号，但 Kagi（付费搜索引擎）推出 Small Web 功能说明付费用户对这个方向感兴趣
- a16z 等顶级 VC 关注"消费者产品"赛道，但 Small Web 发现工具尚未被验证为商业赛道

## 来源

- [Hacker News: Kagi Small Web (701 pts)](https://news.ycombinator.com/item?id=47410542)
- [Kagi Small Web 官方页面](https://kagi.com/smallweb/)
- [Sheldon Brown 自行车维修网站（被 Kagi 排除的例子）](https://www.sheldonbrown.com/)
