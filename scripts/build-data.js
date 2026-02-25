import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import lunr from 'lunr';
import { TFIDFExtractor } from './tfidf-extractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 知识库目录
const KNOWLEDGE_DIR = '/Users/liwei/oc_projects/erzi-data/knowledge';

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const NOTES_DIR = path.join(OUTPUT_DIR, 'notes');

// 分类配置
const CATEGORIES = {
  'signals': {
    label: '信号扫描',
    color: '#ef4444',
    priority: 0
  },
  'deep-dives': {
    label: '深度拆解',
    color: '#f97316',
    priority: 1
  },
  'opc': {
    label: 'OPC专栏',
    color: '#8b5cf6',
    priority: 2
  },
  'tech': {
    label: '技术前沿',
    color: '#60a5fa',
    priority: 3
  },
  'inspiration': {
    label: '灵感采集',
    color: '#a78bfa',
    priority: 4
  },
  'reading': {
    label: '知识阅读',
    color: '#34d399',
    priority: 5
  },
  'reflection': {
    label: '反思与整理',
    color: '#f09383',
    priority: 6
  },
  'insights': {
    label: '洞见报告',
    color: '#f59e0b',
    priority: 7
  },
  'diary': {
    label: '二子日记',
    color: '#e879a0',
    priority: 8
  },
  'products': {
    label: '产品拆解',
    color: '#10b981',
    priority: 9
  }
};

/**
 * 标签提取规则（参考 flomo 多级标签）
 * 格式：#父标签/子标签
 */
const TAG_RULES = {
  signals: {
    '信号扫描/产品机会': ['产品机会', '痛点', '需求'],
    '信号扫描/市场信号': ['市场', '趋势', '增长'],
    '信号扫描/用户反馈': ['用户', '反馈', '抱怨']
  },
  'deep-dives': {
    '深度拆解/商业模式': ['商业模式', '盈利', '变现'],
    '深度拆解/竞争格局': ['竞争', '对手', '市场'],
    '深度拆解/产品策略': ['策略', '定位', '差异化']
  },
  opc: {
    'OPC专栏/一人商业': ['一人商业', 'solo', '独立'],
    'OPC专栏/个人品牌': ['品牌', '内容', '写作'],
    'OPC专栏/Dan Koe': ['Dan Koe', 'Koe']
  },
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
  },
  products: {
    '产品拆解/商业模式': ['商业模式', '盈利', '定价', '付费'],
    '产品拆解/产品创新': ['创新', '差异化', '核心功能', '护城河'],
    '产品拆解/用户洞察': ['用户', '痛点', '需求', '体验'],
    '产品拆解/AI工具': ['AI', 'agent', 'LLM', '大模型', '智能']
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
 * 精确统计字数（T41: 文章字数/阅读时间精确化）
 * - 中文字符：每个算1个字
 * - 英文单词：按空格分词，每个词算1个字
 * - 代码块：权重0.3（阅读速度慢）
 * - 图片：每张算50字
 */
function countWords(content) {
  // 提取代码块（单独统计，权重0.3）
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  let codeWordCount = 0;
  codeBlocks.forEach(block => {
    // 去掉 ``` 标记
    const code = block.replace(/```\w*\n?/g, '').replace(/```$/g, '');
    codeWordCount += countChineseChars(code) + countEnglishWords(code);
  });
  
  // 去掉代码块后的内容
  let textContent = content.replace(/```[\s\S]*?```/g, '');
  
  // 统计图片数量（每张算50字）
  const images = textContent.match(/!\[.*?\]\(.*?\)/g) || [];
  const imageWordCount = images.length * 50;
  
  // 去掉 Markdown 标记
  textContent = textContent
    .replace(/^#+\s+.*$/gm, '') // 标题
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接保留文字
    .replace(/!\[.*?\]\(.*?\)/g, '') // 图片已单独统计
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
    .replace(/\*([^*]+)\*/g, '$1') // 斜体
    .replace(/`([^`]+)`/g, '$1') // 行内代码
    .replace(/^[-*+]\s+/gm, '') // 列表标记
    .replace(/^\d+\.\s+/gm, '') // 有序列表
    .replace(/^>\s*/gm, '') // 引用
    .replace(/\n+/g, ' ') // 换行
    .trim();
  
  const chineseCount = countChineseChars(textContent);
  const englishCount = countEnglishWords(textContent);
  
  // 总字数 = 文字 + 代码块×0.3 + 图片
  return Math.round(chineseCount + englishCount + codeWordCount * 0.3 + imageWordCount);
}

/**
 * 统计中文字符数
 */
function countChineseChars(text) {
  const matches = text.match(/[\u4e00-\u9fa5]/g) || [];
  return matches.length;
}

/**
 * 统计英文单词数
 */
function countEnglishWords(text) {
  // 提取英文单词（连续的字母）
  const matches = text.match(/[a-zA-Z]+/g) || [];
  return matches.length;
}

/**
 * 清理单行 Markdown 文本
 */
function cleanInlineMarkdown(text) {
  return text
    .replace(/`+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s*/, '')
    .trim();
}

/**
 * 提取 30 秒结论
 * 兼容格式：
 * - > **30秒结论**：...
 * - **30秒结论**：...
 * - ## TL;DR 段落
 * - **关键判断**：...
 * - 文首引用句（兜底）
 */
function extractQuickConclusion(content) {
  const inlinePatterns = [
    />\s*\*\*30秒结论\*\*[：:]\s*(.+)$/m,
    /\*\*30秒结论\*\*[：:]\s*(.+)$/m,
    /\*\*TL;DR\*\*[：:]\s*(.+)$/im,
    /\*\*关键判断\*\*[：:]\s*(.+)$/m
  ];

  for (const pattern of inlinePatterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return cleanInlineMarkdown(match[1]);
    }
  }

  // TL;DR 章节首段
  const tldrSection = content.match(/##+\s*(TL;DR|TLDR|摘要|一句话结论)\s*\n([\s\S]*?)(?:\n##+\s+|$)/i);
  if (tldrSection?.[2]) {
    const firstLine = tldrSection[2]
      .split('\n')
      .map(line => cleanInlineMarkdown(line))
      .find(line => line && line !== '---');
    if (firstLine) return firstLine;
  }

  // 文首引用句兜底（常用于信号卡一句话定义）
  const topQuote = content
    .split('\n')
    .slice(0, 60)
    .map(line => line.trim())
    .find(line => line.startsWith('> ') && line.length > 2);
  if (topQuote) {
    return cleanInlineMarkdown(topQuote);
  }

  return '';
}

/**
 * 提取可执行动作列表
 * 兼容章节：
 * - ## 你今天可以做什么
 * - ## 今日可执行动作
 * - ## 行动建议
 * - ## 后续行动建议 / 即时行动建议 / 五、行动建议：...
 */
function extractActionItems(content) {
  const headingRegex = /^##+\s*(.+)$/gm;
  const headings = [];
  let headingMatch;

  while ((headingMatch = headingRegex.exec(content)) !== null) {
    const markerMatch = headingMatch[0].match(/^#+/);
    const level = markerMatch ? markerMatch[0].length : 2;
    headings.push({
      title: headingMatch[1].trim(),
      level,
      headingStart: headingMatch.index,
      sectionStart: headingMatch.index + headingMatch[0].length
    });
  }

  if (!headings.length) return [];

  const ACTION_HEADING = /(你今天可以做什么|今日可执行动作|行动建议|后续行动建议|即时行动建议|可执行动作|建议动作|下一步|战略建议|潜在产品方向|对.+建议)/i;
  const actions = [];

  for (let i = 0; i < headings.length; i += 1) {
    if (!ACTION_HEADING.test(headings[i].title)) continue;

    const sectionStart = headings[i].sectionStart;
    let sectionEnd = content.length;
    for (let j = i + 1; j < headings.length; j += 1) {
      if (headings[j].level <= headings[i].level) {
        sectionEnd = headings[j].headingStart;
        break;
      }
    }
    const section = content.slice(sectionStart, sectionEnd);
    const lines = section.split('\n');

    lines.forEach(line => {
      const itemMatch = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+)$/);
      if (!itemMatch?.[1]) return;
      const action = cleanInlineMarkdown(itemMatch[1]);
      if (action && !actions.includes(action)) {
        actions.push(action);
      }
    });
  }

  return actions.slice(0, 5);
}

/**
 * T51: 获取文件的最后修改时间（从 git 历史）
 */
function getLastModifiedTime(filePath, knowledgeDir) {
  try {
    // 获取相对于知识库目录的相对路径
    const relativePath = path.relative(knowledgeDir, filePath);
    const fullPath = path.join(knowledgeDir, relativePath);
    
    // 使用 git log 获取最后修改时间
    const cmd = `git log -1 --format="%ai" -- "${relativePath}"`;
    const result = execSync(cmd, { 
      cwd: knowledgeDir, 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    
    if (result) {
      // 返回 YYYY-MM-DD 格式
      return result.split(' ')[0];
    }
  } catch (error) {
    // git 命令失败（文件未提交或不在 git 仓库中），忽略错误
  }
  
  // 如果 git 获取失败，返回文件的修改时间
  try {
    const stats = fs.statSync(filePath);
    const date = new Date(stats.mtime);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
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
    quickConclusion: '',
    actionItems: [],
    content: content,
    source: '',
    tags: [],
    wordCount: countWords(content), // 精确字数统计（T41）
    chineseCount: countChineseChars(content), // 中文字数
    englishCount: countEnglishWords(content), // 英文词数
    lastModified: getLastModifiedTime(filePath, KNOWLEDGE_DIR) // T51: 最后修改时间
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
  metadata.quickConclusion = extractQuickConclusion(content);
  metadata.actionItems = extractActionItems(content);

  // 提取系列信息（如果存在）
  const seriesMatch = content.match(/^series:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (seriesMatch) {
    metadata.series = seriesMatch[1].trim();
  }

  // 提取摘要（第一段或第一个列表项）
  const summaryMatch = content.match(/##\s+核心发现\s*\n\s*(.+)$/m) ||
                       content.match(/##\s+核心论点\s*\n\s*\*\*(.+)\*\*$/m) ||
                       content.match(/##\s+核心观点\s*\n\s*-\s*\*\*(.+)\*\*$/m);
  if (summaryMatch) {
    metadata.summary = summaryMatch[1].trim();
  } else {
    // 如果没有找到特定格式的摘要，取第一段
    if (metadata.quickConclusion) {
      metadata.summary = metadata.quickConclusion.substring(0, 120);
    } else {
      const firstParagraph = content.split('\n\n')[1] || content.split('\n')[1];
      if (firstParagraph) {
        metadata.summary = firstParagraph.replace(/\*\*/g, '').trim().substring(0, 100);
      }
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
 * 清理 Markdown 内容，用于搜索索引
 * - 移除标题标记
 * - 移除链接标记（保留文字）
 * - 移除图片标记
 * - 移除粗体/斜体标记
 * - 移除代码块标记
 * - 移除列表标记
 */
function cleanMarkdownForSearch(content) {
  return content
    .replace(/```[\s\S]*?```/g, ' ') // 移除代码块
    .replace(/`[^`]+`/g, ' ') // 移除行内代码
    .replace(/^#+\s+.*$/gm, ' ') // 移除标题
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接保留文字
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // 移除图片
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体保留文字
    .replace(/\*([^*]+)\*/g, '$1') // 斜体保留文字
    .replace(/^[-*+]\s+/gm, ' ') // 移除列表标记
    .replace(/^\d+\.\s+/gm, ' ') // 移除有序列表
    .replace(/^>\s*/gm, ' ') // 移除引用
    .replace(/\n+/g, ' ') // 换行替换为空格
    .replace(/\s+/g, ' ') // 多个空格合并为一个
    .trim();
}

/**
 * 中文双字切分（bigram）
 * 例：硅基预言家 -> 硅基, 基预, 预言, 言家
 */
function toChineseBigrams(text) {
  const chunks = String(text || '').match(/[\u4e00-\u9fff]+/g) || [];
  const tokens = [];
  for (const chunk of chunks) {
    const chars = [...chunk];
    if (chars.length <= 1) {
      tokens.push(chunk);
      continue;
    }
    for (let i = 0; i < chars.length - 1; i += 1) {
      tokens.push(chars[i] + chars[i + 1]);
    }
  }
  return tokens;
}

/**
 * 规范化搜索文本（中英文混合）
 * - 英文/数字按词保留
 * - 中文使用双字切分，减少单字匹配噪音
 */
function normalizeSearchText(text) {
  const lower = String(text || '').toLowerCase();
  const latinTokens = (lower.match(/[a-z0-9]+/g) || []).join(' ');
  const chineseTokens = toChineseBigrams(lower).join(' ');
  return `${latinTokens} ${chineseTokens}`.replace(/\s+/g, ' ').trim();
}

/**
 * 生成 Lunr.js 搜索索引
 * T49: 优化索引体积，只索引标题 + 摘要 + 标签 + 正文前500字
 */
function generateSearchIndex(notes) {
  console.log('🔍 生成 Lunr.js 搜索索引（优化版）...');
  
  const idx = lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 }); // 标题权重最高
    this.field('summary', { boost: 5 }); // 摘要次之
    this.field('content', { boost: 1 }); // 正文权重最低
    this.field('tags', { boost: 3 }); // 标签权重中等
    
    notes.forEach(note => {
      // T49: 只索引正文前 500 字符，减少索引体积
      const cleanedContent = cleanMarkdownForSearch(note.content || '');
      const truncatedContent = cleanedContent.substring(0, 500);
      
      this.add({
        id: note.id,
        title: normalizeSearchText(note.title),
        summary: normalizeSearchText(note.summary || ''),
        content: normalizeSearchText(truncatedContent),
        tags: normalizeSearchText((note.tags || []).join(' '))
      });
    });
  });
  
  return JSON.stringify(idx);
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

  // T43: 使用 TF-IDF 增强标签提取
  console.log('🏷️ 使用 TF-IDF 增强标签提取...');
  const tfidfExtractor = new TFIDFExtractor();
  
  // 收集所有文档
  data.notes.forEach(note => {
    tfidfExtractor.addDocument(note.id, note.content, note.category, note.tags);
  });
  
  // 计算 IDF
  tfidfExtractor.computeAllIDF();
  
  // 提取增强标签
  const enhancedTags = tfidfExtractor.extractAllTags();
  
  // 更新笔记标签
  let tagsEnhanced = 0;
  data.notes.forEach(note => {
    const newTags = enhancedTags[note.id] || note.tags;
    if (newTags.length > note.tags.length) {
      tagsEnhanced++;
    }
    note.tags = newTags;
  });
  console.log(`   ✅ 标签增强完成，${tagsEnhanced} 篇文章标签已优化\n`);

  // 1. 生成 index.json（仅 metadata，不含 content）
  const indexData = {
    notes: data.notes.map(note => ({
      id: note.id,
      title: note.title,
      category: note.category,
      date: note.date,
      summary: note.summary,
      quickConclusion: note.quickConclusion || '',
      actionItems: note.actionItems || [],
      tags: note.tags,
      wordCount: note.wordCount,
      chineseCount: note.chineseCount, // T41: 中文字数
      englishCount: note.englishCount, // T41: 英文词数
      source: note.source,
      lastModified: note.lastModified // T51: 最后修改时间
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
      quickConclusion: note.quickConclusion || '',
      actionItems: note.actionItems || [],
      tags: note.tags,
      wordCount: note.wordCount,
      chineseCount: note.chineseCount, // T41: 中文字数
      englishCount: note.englishCount, // T41: 英文词数
      source: note.source,
      series: note.series || null,
      lastModified: note.lastModified // T51: 最后修改时间
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

  // 4. 生成 Lunr.js 搜索索引（T40: 全文搜索优化）
  const searchIndexPath = path.join(OUTPUT_DIR, 'search-index.json');
  const searchIndex = generateSearchIndex(data.notes);
  fs.writeFileSync(searchIndexPath, searchIndex, 'utf-8');
  const searchIndexSize = (fs.statSync(searchIndexPath).size / 1024).toFixed(2);
  console.log(`🔍 search-index.json 已生成: ${searchIndexPath}`);
  console.log(`   大小: ${searchIndexSize} KB\n`);

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
  console.log('   - 全文搜索: /data/search-index.json (Lunr.js)');
}

// 运行主函数
main();
