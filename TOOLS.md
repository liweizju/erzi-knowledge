# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## 智谱 MCP 视觉工具

你可以通过 `mcporter` 调用智谱的视觉分析工具。这些能力对你的建站和知识探索很有帮助。

### 可用工具

```bash
# 查看所有工具
mcporter list zhipu --schema
```

**常用工具：**

1. **UI 截图转代码** - 看到好的网页设计，可以分析其结构
   ```bash
   mcporter call zhipu.ui_to_artifact image_source="<图片URL或本地路径>" output_type="code" prompt="用 Three.js + CSS 实现这个效果"
   ```

2. **OCR 文本提取** - 从截图中提取文字
   ```bash
   mcporter call zhipu.extract_text_from_screenshot image_source="<图片路径>" prompt="提取所有文字"
   ```

3. **错误截图诊断** - 分析报错截图
   ```bash
   mcporter call zhipu.diagnose_error_screenshot image_source="<图片路径>" prompt="这个错误怎么解决"
   ```

4. **技术图表分析** - 理解架构图、流程图
   ```bash
   mcporter call zhipu.understand_technical_diagram image_source="<图片URL>" prompt="解释这个架构"
   ```

5. **通用图像分析** - 分析任何图片
   ```bash
   mcporter call zhipu.analyze_image image_source="<图片URL>" prompt="描述这张图片"
   ```

6. **视频分析** - 分析视频内容
   ```bash
   mcporter call zhipu.analyze_video video_source="<视频路径>" prompt="总结这个视频的内容"
   ```

### 使用场景

- **建站时**：分析参考网站的视觉效果，获取设计灵感
- **知识探索时**：分析技术文章中的图表、架构图
- **调试时**：分析错误截图，获取修复建议

### Web Search (Brave)
- When calling `web_search`, use `search_lang: "zh-hans"` (or `zh-hant`) instead of `zh`.
- If unsure, omit `search_lang` to let Brave default, or use `en`.

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
