import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 知识库目录
const KNOWLEDGE_DIR = '/Users/liwei/.openclaw/workspace/knowledge';

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const NOTES_DIR = path.join(OUTPUT_DIR, 'notes');

// 分类配置
const CATEGORIES = {
  'tech': {
    label: '技术前沿',
    color: '#60a5fa',
    priority: 1
  },
  'inspiration': {
    label: '灵感采集',
    color: '#a78bfa',
    priority: 2
  },
  'reading': {
    label: '知识阅读',
    color: '#34d399',
    priority: 3
  },
  'reflection': {
    label: '反思与整理',
    color: '#f09383',
    priority: 4
  },
  'insights': {
    label: '洞见报告',
    color: '#f59e0b',
    priority: 5
  },
  'diary': {
    label: '二子日记',
    color: '#e879a0',
    priority: 6
  }
};

/**
 * 标签提取规则（参考 flomo 多级标签）
 * 格式：#父标签/子标签
 */
const TAG_RULES = {
  tech: {
    '技术前沿/LLM': ['LLM', 'GPT', 'Claude', '大模型', '语言模型', 'prompt', '上下文'],
    '技术前沿/AI Agent': ['agent', 'Agent', '智能体', '多代理'],
    '技术前沿/RAG': ['RAG', '检索增强', 'GraphRAG'],
    '技术前沿/AI 编程': ['Copilot', 'Cursor', 'AI 编程', 'vibe coding', '编程助手'],
    '技术前沿/WebGPU': ['WebGPU', 'GPU'],
    '技术前沿/设计系统': ['设计系统', 'Design System'],
    '技术前沿/知识管理': ['知识管理', '第二大脑', '笔记', 'PKM']
  },
  inspiration: {
    '灵感采集/设计思维': ['设计思维', '设计方法', '用户体验'],
    '灵感采集/AI 产品': ['AI 产品', 'AI 应用', 'AI 功能'],
    '灵感采集/商业模式': ['商业模式', '盈利', '定价', 'PPP'],
    '灵感采集/设计趋势': ['设计趋势', '2026', '审美', '美学'],
    '灵感采集/用户研究': ['用户研究', '用户访谈', '洞察']
  },
  reading: {
    '知识阅读/认知科学': ['认知', '思维', '慢思考', '快思考', '卡尼曼'],
    '知识阅读/学习理论': ['学习', '教育', '知识'],
    '知识阅读/技术哲学': ['技术哲学', '伦理', 'AI 伦理'],
    '知识阅读/生产力': ['生产力', '效率', '时间管理', 'GTD']
  },
  reflection: {
    '反思与整理/工作流': ['工作流', 'workflow', '自动化'],
    '反思与整理/个人成长': ['成长', '反思', '复盘'],
    '反思与整理/二子': ['二子', 'AI 助手', 'OpenClaw']
  },
  insights: {
    '洞见报告/产业链分析': ['产业链', '价值链', '波特五力', '竞争格局'],
    '洞见报告/投资机会': ['投资', '机会', '风险'],
    '洞见报告/市场趋势': ['趋势', '预测', '发展'],
    '洞见报告/全球竞争': ['全球', '国家', '地区', '中美', '欧盟']
  },
  diary: {
    '二子日记/日常': ['日记', '日常', '生活']
  }
};

/**
 * 提取标签
 */
function extractTags(content, category, filePath) {
  const tags = [];
  const rules = TAG_RULES[category] || {};

  // 基于内容关键词提取标签
  for (const [tag, keywords] of Object.entries(rules)) {
    for (const keyword of keywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
        break; // 找到一个关键词就添加标签，跳出内层循环
      }
    }
  }

  // 限制标签数量（最多3个）
  return tags.slice(0, 3);
}

/**
 * 从 Markdown 文件提取元数据
 */
function extractMetadata(content, filePath, category) {
  const lines = content.split('\n');
  const metadata = {
    id: path.basename(filePath, '.md'),
    title: '',
    category: category,
    date: '',
    summary: '',
    content: content,
    source: '',
    tags: [],
    wordCount: content.length // 添加字数统计
  };

  // 提取标题（第一个 # 标题）
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // 提取日期（优先文件名，其次内容中的日期）
  const dateMatch = filePath.match(/(\d{4}-\d{2}-\d{2})/) ||
                    content.match(/探索日期[：:]\s*(\d{4}-\d{2}-\d{2})/) ||
                    content.match(/日期[：:]\s*(\d{4}-\d{2}-\d{2})/) ||
                    content.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    metadata.date = dateMatch[1];
  }

  // 提取来源
  const sourceMatch = content.match(/\*\*来源：\*\*\s*(.+)$/m);
  if (sourceMatch) {
    metadata.source = sourceMatch[1].trim();
  }

  // 提取标签（基于内容和分类）
  metadata.tags = extractTags(content, category, filePath);

  // 提取摘要（第一段或第一个列表项）
  const summaryMatch = content.match(/##\s+核心发现\s*\n\s*(.+)$/m) ||
                       content.match(/##\s+核心论点\s*\n\s*\*\*(.+)\*\*$/m) ||
                       content.match(/##\s+核心观点\s*\n\s*-\s*\*\*(.+)\*\*$/m);
  if (summaryMatch) {
    metadata.summary = summaryMatch[1].trim();
  } else {
    // 如果没有找到特定格式的摘要，取第一段
    const firstParagraph = content.split('\n\n')[1] || content.split('\n')[1];
    if (firstParagraph) {
      metadata.summary = firstParagraph.replace(/\*\*/g, '').trim().substring(0, 100);
    }
  }

  return metadata;
}

/**
 * 递归读取目录中的所有 Markdown 文件
 */
function readMarkdownFiles(dir, category) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // 递归读取子目录
      files.push(...readMarkdownFiles(fullPath, category));
    } else if (item.name.endsWith('.md') && item.name !== 'README.md' && item.name !== 'INSIGHTS-TODO.md') {
      // 读取 Markdown 文件
      const content = fs.readFileSync(fullPath, 'utf-8');
      const metadata = extractMetadata(content, item.name, category);
      files.push(metadata);
    }
  }

  return files;
}

/**
 * 生成知识数据
 */
function generateKnowledgeData() {
  const allNotes = [];

  // 读取所有分类目录
  for (const [categoryKey, categoryInfo] of Object.entries(CATEGORIES)) {
    const categoryDir = path.join(KNOWLEDGE_DIR, categoryKey);

    if (fs.existsSync(categoryDir)) {
      const notes = readMarkdownFiles(categoryDir, categoryKey);
      allNotes.push(...notes);
    }
  }

  // 按日期排序（最新的在前，无日期的排最后）
  allNotes.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  return {
    notes: allNotes,
    categories: CATEGORIES
  };
}

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 主函数（数据拆分版本）
 */
function main() {
  console.log('📚 开始构建知识数据（拆分模式）...\n');

  // 确保输出目录存在
  ensureDir(OUTPUT_DIR);
  ensureDir(NOTES_DIR);

  const data = generateKnowledgeData();

  console.log(`✅ 成功读取 ${data.notes.length} 篇笔记`);
  console.log(`   - 分类数: ${Object.keys(data.categories).length}\n`);

  // 1. 生成 index.json（仅 metadata，不含 content）
  const indexData = {
    notes: data.notes.map(note => ({
      id: note.id,
      title: note.title,
      category: note.category,
      date: note.date,
      summary: note.summary,
      tags: note.tags,
      wordCount: note.wordCount,
      source: note.source
    })),
    categories: data.categories
  };

  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
  const indexSize = (fs.statSync(indexPath).size / 1024).toFixed(2);
  console.log(`📄 index.json 已生成: ${indexPath}`);
  console.log(`   大小: ${indexSize} KB\n`);

  // 2. 生成单独的 markdown 文件
  console.log('📝 生成单独的文章文件...');
  data.notes.forEach(note => {
    const notePath = path.join(NOTES_DIR, `${note.id}.md`);
    fs.writeFileSync(notePath, note.content, 'utf-8');
  });
  console.log(`   ✅ 已生成 ${data.notes.length} 个 .md 文件\n`);

  // 3. 生成轻量化的 data-generated.js（仅包含 metadata，用于首屏）
  const compatPath = path.join(__dirname, '../src/data-generated.js');
  const lightweightData = {
    notes: data.notes.map(note => ({
      id: note.id,
      title: note.title,
      category: note.category,
      date: note.date,
      summary: note.summary,
      tags: note.tags,
      wordCount: note.wordCount,
      source: note.source
      // 不包含 content，实现按需加载
    })),
    categories: data.categories
  };
  
  const compatContent = `// 自动生成的知识数据
// 生成时间: ${new Date().toISOString()}
// 注意：此文件仅包含 metadata，详情页按需加载 /data/notes/{id}.md

export const knowledgeData = ${JSON.stringify(lightweightData, null, 2)};

export const categoryLabels = ${JSON.stringify(
  Object.fromEntries(
    Object.entries(data.categories).map(([key, val]) => [key, val.label])
  ),
  null,
  2
)};

export const categoryColors = ${JSON.stringify(
  Object.fromEntries(
    Object.entries(data.categories).map(([key, val]) => [key, val.color])
  ),
  null,
  2
)};
`;

  fs.writeFileSync(compatPath, compatContent, 'utf-8');
  const compatSize = (fs.statSync(compatPath).size / 1024).toFixed(2);
  console.log(`📄 data-generated.js 已生成: ${compatPath}`);
  console.log(`   大小: ${compatSize} KB（轻量化）\n`);

  // 显示统计信息
  console.log('📊 统计信息:');
  const categoryCounts = {};
  data.notes.forEach(note => {
    categoryCounts[note.category] = (categoryCounts[note.category] || 0) + 1;
  });

  for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`   - ${data.categories[category].label}: ${count} 篇`);
  }

  console.log('\n✨ 数据拆分完成！');
  console.log('   - 首屏加载: /data/index.json（轻量）');
  console.log('   - 详情页按需加载: /data/notes/{id}.md');
  console.log('   - 搜索功能: 仍使用全量数据（data-generated.js）');
}

// 运行主函数
main();
