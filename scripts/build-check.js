#!/usr/bin/env node
/**
 * T47: 构建门禁脚本
 * - 检查关键产物是否存在
 * - 检查包体大小是否超限
 * - 记录构建历史
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const HISTORY_FILE = path.join(__dirname, '../build-history.json');

// 包体预算（单位：KB）
const BUDGET = {
  indexHtml: 10,        // index.html
  css: 30,              // CSS 文件
  js: 500,              // JS 文件（警告）
  jsMax: 1500,          // JS 文件（硬限制）
  dataIndex: 150,       // data/index.json
  searchIndex: 1500,    // data/search-index.json
};

// 关键产物
const REQUIRED_FILES = [
  'index.html',
  'manifest.json',
  'sw.js',
  'data/index.json',
  'assets'
];

/**
 * 检查文件是否存在
 */
function checkFiles() {
  const errors = [];
  const warnings = [];
  
  console.log('📁 检查关键产物...\n');
  
  REQUIRED_FILES.forEach(file => {
    const filePath = path.join(DIST_DIR, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`缺失: ${file}`);
    } else {
      console.log(`  ✅ ${file}`);
    }
  });
  
  return { errors, warnings };
}

/**
 * 检查包体大小
 */
function checkSizes() {
  const errors = [];
  const warnings = [];
  const sizes = {};
  
  console.log('\n📦 检查包体大小...\n');
  
  // 检查 index.html
  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    const size = fs.statSync(indexHtml).size / 1024;
    sizes.indexHtml = size;
    if (size > BUDGET.indexHtml) {
      warnings.push(`index.html: ${size.toFixed(2)}KB > ${BUDGET.indexHtml}KB`);
    }
    console.log(`  index.html: ${size.toFixed(2)}KB ${size > BUDGET.indexHtml ? '⚠️' : '✅'}`);
  }
  
  // 检查 CSS 文件
  const assetsDir = path.join(DIST_DIR, 'assets');
  if (fs.existsSync(assetsDir)) {
    const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));
    cssFiles.forEach(file => {
      const size = fs.statSync(path.join(assetsDir, file)).size / 1024;
      sizes.css = (sizes.css || 0) + size;
    });
    if (sizes.css > BUDGET.css) {
      warnings.push(`CSS 总计: ${sizes.css.toFixed(2)}KB > ${BUDGET.css}KB`);
    }
    console.log(`  CSS 总计: ${(sizes.css || 0).toFixed(2)}KB ${(sizes.css || 0) > BUDGET.css ? '⚠️' : '✅'}`);
  }
  
  // 检查 JS 文件
  if (fs.existsSync(assetsDir)) {
    const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
    jsFiles.forEach(file => {
      const size = fs.statSync(path.join(assetsDir, file)).size / 1024;
      sizes.js = (sizes.js || 0) + size;
    });
    if (sizes.js > BUDGET.jsMax) {
      errors.push(`JS 总计: ${sizes.js.toFixed(2)}KB > ${BUDGET.jsMax}KB (硬限制)`);
    } else if (sizes.js > BUDGET.js) {
      warnings.push(`JS 总计: ${sizes.js.toFixed(2)}KB > ${BUDGET.js}KB (建议优化)`);
    }
    console.log(`  JS 总计: ${(sizes.js || 0).toFixed(2)}KB ${(sizes.js || 0) > BUDGET.jsMax ? '❌' : (sizes.js || 0) > BUDGET.js ? '⚠️' : '✅'}`);
  }
  
  // 检查 data/index.json
  const dataIndex = path.join(DIST_DIR, 'data/index.json');
  if (fs.existsSync(dataIndex)) {
    const size = fs.statSync(dataIndex).size / 1024;
    sizes.dataIndex = size;
    if (size > BUDGET.dataIndex) {
      warnings.push(`data/index.json: ${size.toFixed(2)}KB > ${BUDGET.dataIndex}KB`);
    }
    console.log(`  data/index.json: ${size.toFixed(2)}KB ${size > BUDGET.dataIndex ? '⚠️' : '✅'}`);
  }
  
  // 检查 data/search-index.json
  const searchIndex = path.join(DIST_DIR, 'data/search-index.json');
  if (fs.existsSync(searchIndex)) {
    const size = fs.statSync(searchIndex).size / 1024;
    sizes.searchIndex = size;
    if (size > BUDGET.searchIndex) {
      warnings.push(`data/search-index.json: ${size.toFixed(2)}KB > ${BUDGET.searchIndex}KB`);
    }
    console.log(`  data/search-index.json: ${size.toFixed(2)}KB ${size > BUDGET.searchIndex ? '⚠️' : '✅'}`);
  }
  
  return { errors, warnings, sizes };
}

/**
 * 记录构建历史
 */
function recordHistory(sizes) {
  let history = [];
  
  // 读取历史记录
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch (e) {
      history = [];
    }
  }
  
  // 添加新记录
  history.push({
    timestamp: new Date().toISOString(),
    sizes: sizes,
    budget: BUDGET
  });
  
  // 只保留最近 50 次构建
  if (history.length > 50) {
    history = history.slice(-50);
  }
  
  // 写入文件
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  console.log('\n📊 构建历史已记录\n');
}

/**
 * 主函数
 */
function main() {
  console.log('🚪 构建门禁检查\n');
  console.log('='.repeat(50) + '\n');
  
  // 检查 dist 目录是否存在
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist 目录不存在，请先运行 npm run build\n');
    process.exit(1);
  }
  
  // 检查文件
  const fileResult = checkFiles();
  
  // 检查大小
  const sizeResult = checkSizes();
  
  // 记录历史
  recordHistory(sizeResult.sizes);
  
  // 汇总结果
  console.log('='.repeat(50) + '\n');
  
  const allErrors = [...fileResult.errors, ...sizeResult.errors];
  const allWarnings = [...fileResult.warnings, ...sizeResult.warnings];
  
  if (allErrors.length > 0) {
    console.error('❌ 构建门禁失败:\n');
    allErrors.forEach(e => console.error(`   - ${e}`));
    console.error('\n请修复上述问题后重新构建。\n');
    process.exit(1);
  }
  
  if (allWarnings.length > 0) {
    console.warn('⚠️ 构建警告:\n');
    allWarnings.forEach(w => console.warn(`   - ${w}`));
    console.warn('');
  }
  
  console.log('✅ 构建门禁通过！\n');
  process.exit(0);
}

main();
