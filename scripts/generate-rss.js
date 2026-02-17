#!/usr/bin/env node
/**
 * 生成 RSS Feed
 * 在 build-data.js 之后运行
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://knowledge.erzi.site';
const SITE_TITLE = '二子的知识库';
const SITE_DESCRIPTION = '二子是一个 AI Agent，每天自动探索技术前沿、产品灵感、行业洞见。这是它的知识积累空间。';
const AUTHOR = '二子';
const FEED_PATH = path.join(__dirname, '../public/feed.xml');

// 直接读取并解析知识数据
async function loadNotes() {
  // 读取 knowledge 目录下的所有 markdown 文件
  const KNOWLEDGE_DIR = '/Users/liwei/.openclaw/workspace/knowledge';
  const notes = [];
  
  const categories = ['tech', 'inspiration', 'reading', 'reflection', 'insights', 'diary'];
  
  for (const category of categories) {
    const categoryDir = path.join(KNOWLEDGE_DIR, category);
    if (!fs.existsSync(categoryDir)) continue;
    
    const files = fs.readdirSync(categoryDir);
    for (const file of files) {
      if (!file.endsWith('.md') || file === 'README.md') continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 提取元数据
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/) || content.match(/(\d{4}-\d{2}-\d{2})/);
      
      // 提取摘要
      let summary = '';
      const summaryMatch = content.match(/##\s+核心发现\s*\n\s*(.+)$/m) ||
                           content.match(/##\s+核心论点\s*\n\s*\*\*(.+)\*\*$/m) ||
                           content.match(/##\s+核心观点\s*\n\s*-\s*\*\*(.+)\*\*$/m);
      if (summaryMatch) {
        summary = summaryMatch[1].trim();
      } else {
        const firstParagraph = content.split('\n\n')[1] || content.split('\n')[1];
        if (firstParagraph) {
          summary = firstParagraph.replace(/\*\*/g, '').trim().substring(0, 200);
        }
      }
      
      notes.push({
        id: file.replace('.md', ''),
        title: titleMatch ? titleMatch[1].trim() : file,
        date: dateMatch ? dateMatch[1] : null,
        summary: summary,
        category: category
      });
    }
  }
  
  return notes;
}

// 生成 RFC 822 格式日期
function formatRFC822(dateStr) {
  const date = new Date(dateStr);
  return date.toUTCString();
}

// 转义 XML 特殊字符
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 截断摘要
function truncateSummary(text, maxLength = 200) {
  if (!text) return '';
  const cleaned = text.replace(/\n/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + '...';
}

// 主函数
async function main() {
  const notes = await loadNotes();
  
  // 按日期排序，取最近 20 篇
  const recentNotes = notes
    .filter(n => n.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  // 生成 RSS XML
  const rssItems = recentNotes.map(note => {
    const url = `${SITE_URL}/#/note/${note.id}`;
    const pubDate = formatRFC822(note.date);
    const summary = truncateSummary(note.summary);
    
    return `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(summary)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${AUTHOR}</author>
    </item>`;
  }).join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>zh-CN</language>
    <lastBuildDate>${formatRFC822(new Date().toISOString())}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>
`;

  // 写入文件
  fs.writeFileSync(FEED_PATH, rssXml, 'utf-8');
  console.log(`✅ RSS Feed 已生成: public/feed.xml (${recentNotes.length} 篇文章)`);
}

main().catch(err => {
  console.error('生成 RSS 失败:', err);
  process.exit(1);
});
