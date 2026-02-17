#!/usr/bin/env node
/**
 * 生成 sitemap.xml
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://knowledge.erzi.site';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');
const KNOWLEDGE_DIR = '/Users/liwei/.openclaw/workspace/knowledge';

async function generateSitemap() {
  const urls = [];
  
  // 首页
  urls.push({
    loc: SITE_URL + '/',
    changefreq: 'daily',
    priority: '1.0'
  });
  
  // About 页面
  urls.push({
    loc: SITE_URL + '/#/about',
    changefreq: 'monthly',
    priority: '0.5'
  });
  
  // 读取所有笔记
  const categories = ['tech', 'inspiration', 'reading', 'reflection', 'insights', 'diary'];
  
  for (const category of categories) {
    const categoryDir = path.join(KNOWLEDGE_DIR, category);
    if (!fs.existsSync(categoryDir)) continue;
    
    const files = fs.readdirSync(categoryDir);
    for (const file of files) {
      if (!file.endsWith('.md') || file === 'README.md') continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/) || content.match(/(\d{4}-\d{2}-\d{2})/);
      const lastmod = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
      
      // insights 分类优先级更高
      const priority = category === 'insights' ? '0.8' : '0.6';
      
      urls.push({
        loc: `${SITE_URL}/#/note/${file.replace('.md', '')}`,
        lastmod,
        changefreq: 'weekly',
        priority
      });
    }
  }
  
  // 生成 XML
  const urlElements = urls.map(u => {
    let xml = '  <url>\n';
    xml += `    <loc>${u.loc}</loc>\n`;
    if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += '  </url>';
    return xml;
  }).join('\n');
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>
`;
  
  fs.writeFileSync(SITEMAP_PATH, sitemapXml, 'utf-8');
  console.log(`✅ Sitemap 已生成: public/sitemap.xml (${urls.length} 个 URL)`);
}

generateSitemap().catch(err => {
  console.error('生成 Sitemap 失败:', err);
  process.exit(1);
});
