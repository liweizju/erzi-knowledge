import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 知识库目录
const KNOWLEDGE_DIR = '/Users/liwei/.openclaw/workspace/knowledge';

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
  'diary': {
    label: '二子日记',
    color: '#e879a0',
    priority: 5
  },
  'insights': {
    label: '洞见报告',
    color: '#f59e0b',
    priority: 6
  }
};

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
    source: ''
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
    } else if (item.name.endsWith('.md') && item.name !== 'README.md') {
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
 * 主函数
 */
function main() {
  console.log('📚 开始构建知识数据...\n');

  const data = generateKnowledgeData();

  console.log(`✅ 成功读取 ${data.notes.length} 篇笔记`);
  console.log(`   - 分类数: ${Object.keys(data.categories).length}\n`);

  // 生成输出数据
  const outputPath = path.join(__dirname, '../src/data-generated.js');
  const outputContent = `// 自动生成的知识数据
// 生成时间: ${new Date().toISOString()}

export const knowledgeData = ${JSON.stringify(data, null, 2)};

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

  fs.writeFileSync(outputPath, outputContent, 'utf-8');
  console.log(`📄 数据已保存到: ${outputPath}\n`);

  // 显示统计信息
  console.log('📊 统计信息:');
  const categoryCounts = {};
  data.notes.forEach(note => {
    categoryCounts[note.category] = (categoryCounts[note.category] || 0) + 1;
  });

  for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`   - ${data.categories[category].label}: ${count} 篇`);
  }
}

// 运行主函数
main();
