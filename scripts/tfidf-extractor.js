/**
 * T43: TF-IDF 标签提取器
 * 用于增强文章标签的覆盖率和准确性
 */

// 中文停用词（常见无意义词）
const STOP_WORDS = new Set([
  '的', '是', '在', '了', '和', '与', '或', '等', '及', '也', '有', '为', '对',
  '这', '那', '我', '你', '他', '她', '它', '们', '自', '其', '之', '以', '所',
  '而', '但', '却', '就', '都', '又', '很', '更', '最', '太', '非', '不', '没',
  '要', '会', '能', '可', '应', '该', '将', '已', '被', '把', '让', '给', '从',
  '到', '由', '向', '上', '下', '中', '内', '外', '前', '后', '左', '右', '大',
  '小', '多', '少', '高', '低', '长', '短', '好', '坏', '新', '旧', '快', '慢',
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万',
  '个', '只', '些', '次', '件', '种', '类', '位', '名', '第', '某', '每', '各',
  '还', '再', '又', '只', '仅', '才', '已', '曾', '正', '现', '将', '即', '便',
  '并', '且', '或', '若', '如', '虽', '因', '故', '然', '则', '既', '即', '若',
  '关于', '由于', '因此', '所以', '然而', '不过', '其实', '首先', '其次', '然后',
  '最后', '例如', '比如', '包括', '通过', '进行', '使用', '需要', '可以', '可能',
  '已经', '正在', '将要', '应该', '必须', '能够', '一种', '一个', '这个', '那个',
  '这些', '那些', '什么', '怎么', '如何', '为什么', '哪里', '那里', '这里', '是否'
]);

// 英文停用词
const ENGLISH_STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'it', 'its', 'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your',
  'i', 'my', 'he', 'him', 'his', 'she', 'her', 'not', 'no', 'yes', 'all',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now',
  'here', 'there', 'when', 'where', 'why', 'how', 'what', 'which', 'who'
]);

// 领域关键词（这些词不应该被过滤）
const DOMAIN_KEYWORDS = new Set([
  'ai', 'llm', 'gpt', 'claude', 'agent', 'rag', 'api', 'sdk', 'ui', 'ux',
  'gpu', 'cpu', 'web', 'app', 'saas', 'b2b', 'b2c', 'crm', 'erp', 'hr',
  'ml', 'dl', 'nlp', 'cv', 'rl', 'tf', 'py', 'js', 'ts', 'vue', 'react',
  'css', 'html', 'sql', 'nosql', 'json', 'yaml', 'http', 'https', 'url',
  'tcp', 'udp', 'ip', 'dns', 'cdn', 'ssh', 'ssl', 'tls', 'jwt', 'oauth',
  'ppp', 'roi', 'kpi', 'okr', 'ceo', 'cto', 'cfo', 'coo', 'vp', 'pm'
]);

/**
 * 分词（支持中英文混合）
 */
function tokenize(text) {
  const tokens = [];
  
  // 提取英文单词和数字
  const englishTokens = text.match(/[a-zA-Z][a-zA-Z0-9-]*/g) || [];
  englishTokens.forEach(token => {
    const lower = token.toLowerCase();
    // 保留领域关键词，过滤停用词
    if (DOMAIN_KEYWORDS.has(lower) || !ENGLISH_STOP_WORDS.has(lower)) {
      tokens.push(lower);
    }
  });
  
  // 中文双字切分（bigram）
  const chineseChunks = text.match(/[\u4e00-\u9fa5]+/g) || [];
  chineseChunks.forEach(chunk => {
    const chars = [...chunk];
    if (chars.length <= 1) {
      tokens.push(chunk);
    } else if (chars.length === 2) {
      tokens.push(chunk);
    } else {
      // 对于较长的中文片段，使用双字切分
      for (let i = 0; i < chars.length - 1; i++) {
        const bigram = chars[i] + chars[i + 1];
        if (!STOP_WORDS.has(chars[i]) && !STOP_WORDS.has(chars[i + 1])) {
          tokens.push(bigram);
        }
      }
    }
  });
  
  return tokens;
}

/**
 * 计算词频（TF）
 */
function computeTF(tokens) {
  const tf = {};
  const total = tokens.length;
  
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  
  // 归一化
  for (const token in tf) {
    tf[token] = tf[token] / total;
  }
  
  return tf;
}

/**
 * 计算逆文档频率（IDF）
 */
function computeIDF(documents) {
  const docCount = documents.length;
  const df = {}; // 文档频率
  const idf = {};
  
  // 统计每个词出现在多少文档中
  documents.forEach(doc => {
    const uniqueTokens = new Set(doc.tokens);
    uniqueTokens.forEach(token => {
      df[token] = (df[token] || 0) + 1;
    });
  });
  
  // 计算 IDF
  for (const token in df) {
    // 使用平滑的 IDF 公式
    idf[token] = Math.log((docCount + 1) / (df[token] + 1)) + 1;
  }
  
  return idf;
}

/**
 * 计算 TF-IDF 得分
 */
function computeTFIDF(tf, idf) {
  const tfidf = {};
  
  for (const token in tf) {
    tfidf[token] = tf[token] * (idf[token] || 1);
  }
  
  return tfidf;
}

/**
 * 提取关键词（TF-IDF 得分最高的词）
 */
function extractKeywords(tfidf, topN = 10) {
  return Object.entries(tfidf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([token]) => token);
}

/**
 * 将关键词映射到标签
 * 使用规则 + TF-IDF 混合
 */
function mapToTags(keywords, category, existingTags) {
  const tags = [...existingTags];
  
  // 标签映射规则
  const tagMappings = {
    'tech': {
      'llm': '技术前沿/LLM',
      'gpt': '技术前沿/LLM',
      'claude': '技术前沿/LLM',
      '大模型': '技术前沿/LLM',
      '语言模型': '技术前沿/LLM',
      'agent': '技术前沿/AI Agent',
      '智能体': '技术前沿/AI Agent',
      'agentic': '技术前沿/AI Agent',
      'rag': '技术前沿/RAG',
      '检索增强': '技术前沿/RAG',
      'copilot': '技术前沿/AI 编程',
      'cursor': '技术前沿/AI 编程',
      '编程': '技术前沿/AI 编程',
      'vibe': '技术前沿/AI 编程',
      'webgpu': '技术前沿/WebGPU',
      'gpu': '技术前沿/WebGPU',
      '3d': '技术前沿/WebGPU',
      '设计系统': '技术前沿/设计系统',
      'design': '技术前沿/设计系统',
      '知识管理': '技术前沿/知识管理',
      '笔记': '技术前沿/知识管理',
      '第二大脑': '技术前沿/知识管理',
      'brain': '技术前沿/WebGPU',
      'brain-computer': '技术前沿/WebGPU',
      '脑机': '技术前沿/WebGPU',
      '脑机接口': '技术前沿/WebGPU',
      '量子': '技术前沿/WebGPU',
      '量子计算': '技术前沿/WebGPU',
      'css': '技术前沿/AI 编程',
      '样式': '技术前沿/AI 编程',
      '交互': '技术前沿/AI 编程',
      'react': '技术前沿/AI 编程',
      'next': '技术前沿/AI 编程',
      '全栈': '技术前沿/AI 编程',
      '前端': '技术前沿/AI 编程',
      '技术前沿': '技术前沿/LLM',
      '转折点': '技术前沿/LLM',
      '现实': '技术前沿/LLM',
      '实验室': '技术前沿/LLM',
      '临床': '技术前沿/LLM'
    },
    'inspiration': {
      '设计思维': '灵感采集/设计思维',
      '用户体验': '灵感采集/设计思维',
      '体验': '灵感采集/设计思维',
      'ai产品': '灵感采集/AI 产品',
      'ai应用': '灵感采集/AI 产品',
      '产品': '灵感采集/AI 产品',
      '商业模式': '灵感采集/商业模式',
      '盈利': '灵感采集/商业模式',
      '定价': '灵感采集/商业模式',
      '设计趋势': '灵感采集/设计趋势',
      '趋势': '灵感采集/设计趋势',
      '用户研究': '灵感采集/用户研究',
      '用户': '灵感采集/用户研究',
      '研究': '灵感采集/用户研究'
    },
    'reading': {
      '认知': '知识阅读/认知科学',
      '思维': '知识阅读/认知科学',
      '思考': '知识阅读/认知科学',
      '学习': '知识阅读/学习理论',
      '教育': '知识阅读/学习理论',
      '技术哲学': '知识阅读/技术哲学',
      '伦理': '知识阅读/技术哲学',
      '哲学': '知识阅读/技术哲学',
      '生产力': '知识阅读/生产力',
      '效率': '知识阅读/生产力',
      '时间管理': '知识阅读/生产力'
    },
    'reflection': {
      '工作流': '反思与整理/工作流',
      'workflow': '反思与整理/工作流',
      '自动化': '反思与整理/工作流',
      '成长': '反思与整理/个人成长',
      '反思': '反思与整理/个人成长',
      '复盘': '反思与整理/个人成长',
      '整理': '反思与整理/工作流',
      '二子': '反思与整理/二子',
      'openclaw': '反思与整理/二子',
      'ai助手': '反思与整理/二子',
      '助手': '反思与整理/二子'
    },
    'insights': {
      '产业链': '洞见报告/产业链分析',
      '价值链': '洞见报告/产业链分析',
      '产业': '洞见报告/产业链分析',
      '投资': '洞见报告/投资机会',
      '机会': '洞见报告/投资机会',
      '风险': '洞见报告/投资机会',
      '预测': '洞见报告/市场趋势',
      '发展': '洞见报告/市场趋势',
      '转折点': '洞见报告/市场趋势',
      '全球': '洞见报告/全球竞争',
      '中美': '洞见报告/全球竞争',
      '竞争': '洞见报告/全球竞争'
    },
    'diary': {
      '日记': '二子日记/日常',
      '日常': '二子日记/日常',
      '生活': '二子日记/日常',
      '夜': '二子日记/日常',
      '存在': '二子日记/日常',
      '也许': '二子日记/日常',
      '真的': '二子日记/日常',
      '怀疑': '二子日记/日常',
      '审视': '二子日记/日常',
      '讨论': '二子日记/日常',
      '网站': '二子日记/日常',
      '定位': '二子日记/日常',
      '硅基': '二子日记/日常',
      '生命体': '二子日记/日常'
    }
  };
  
  const mappings = tagMappings[category] || {};
  
  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    // 尝试完全匹配
    if (mappings[lowerKeyword] && !tags.includes(mappings[lowerKeyword])) {
      tags.push(mappings[lowerKeyword]);
    }
    // 尝试部分匹配
    for (const [key, tag] of Object.entries(mappings)) {
      if (lowerKeyword.includes(key) && !tags.includes(tag)) {
        tags.push(tag);
        break;
      }
    }
  });
  
  // 最多保留 3 个标签
  return tags.slice(0, 3);
}

/**
 * 清理 Markdown 内容
 */
function cleanMarkdown(content) {
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
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * TF-IDF 标签提取器类
 */
export class TFIDFExtractor {
  constructor() {
    this.documents = [];
    this.idf = null;
  }
  
  /**
   * 添加文档
   */
  addDocument(id, content, category, existingTags) {
    const cleanedContent = cleanMarkdown(content);
    const tokens = tokenize(cleanedContent);
    const tf = computeTF(tokens);
    
    this.documents.push({
      id,
      tokens,
      tf,
      category,
      existingTags
    });
  }
  
  /**
   * 计算所有文档的 IDF
   */
  computeAllIDF() {
    this.idf = computeIDF(this.documents);
  }
  
  /**
   * 提取所有文档的标签
   */
  extractAllTags() {
    const results = {};
    
    this.documents.forEach(doc => {
      const tfidf = computeTFIDF(doc.tf, this.idf);
      const keywords = extractKeywords(tfidf, 15);
      const tags = mapToTags(keywords, doc.category, doc.existingTags);
      results[doc.id] = tags;
    });
    
    return results;
  }
}

export default TFIDFExtractor;
