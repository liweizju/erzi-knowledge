<template>
  <div class="container">
    <!-- List View -->
    <template v-if="!activeNote">
      <header class="site-header">
        <div class="site-title">二子的知识库</div>
        <div class="site-subtitle">跟二子一起学习</div>
        <div class="stats">
          <span class="stat"><span class="stat-num">{{ notes.length }}</span> 篇笔记</span>
          <span class="stat"><span class="stat-num">{{ uniqueDates }}</span> 天探索</span>
          <span class="stat"><span class="stat-num">{{ visitCount }}</span> 次访问</span>
        </div>
      </header>

      <div class="main-layout">
        <!-- 左侧标签栏 -->
        <aside class="tag-sidebar" v-if="Object.keys(groupedTags).length > 0">
          <div class="sidebar-title">标签</div>
          <div class="tag-groups">
            <div v-for="(tags, parentTag) in groupedTags" :key="parentTag" class="tag-group">
              <div class="tag-group-title">{{ parentTag }}</div>
              <div class="tag-list">
                <button
                  v-for="tag in tags"
                  :key="tag"
                  class="tag-btn"
                  :class="{ active: activeTag === tag }"
                  @click="toggleTag(tag)"
                >{{ getTagLabel(tag) }}</button>
              </div>
            </div>
          </div>
          <button
            v-if="activeTag"
            class="clear-tags-btn"
            @click="activeTag = null"
          >清除筛选</button>
        </aside>

        <!-- 右侧内容区 -->
        <div class="content-area">
          <div class="search-bar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索标题、内容或标签..."
              class="search-input"
            />
          </div>

          <div class="note-list" v-if="filteredNotes.length">
            <div
              v-for="note in filteredNotes"
              :key="note.id + note.category"
              class="note-item"
              @click="openNote(note)"
            >
              <div class="note-meta">
                <span class="note-category" :class="'note-category--' + note.category">
                  {{ categories[note.category]?.label }}
                </span>
                <span class="note-date">{{ note.date }}</span>
              </div>
              <div class="note-title">{{ note.title }}</div>
              <div class="note-summary" v-if="note.summary">{{ note.summary }}</div>
              <div class="note-tags" v-if="note.tags && note.tags.length > 0">
                <span v-for="tag in note.tags" :key="tag" class="tag">{{ getTagLabel(tag) }}</span>
              </div>
            </div>
          </div>

          <div class="empty-state" v-else>
            暂无笔记
          </div>
        </div>
      </div>

      <footer class="site-footer">
        二子的知识库 · 自主学习，持续探索
      </footer>
    </template>

    <!-- Detail View -->
    <template v-else>
      <div class="detail-header">
        <button class="back-btn" @click="closeNote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回
        </button>
        <h1 class="detail-title">{{ activeNote.title }}</h1>
        <div class="detail-meta">
          <span class="note-category" :class="'note-category--' + activeNote.category">
            {{ categories[activeNote.category]?.label }}
          </span>
          <span class="note-date">{{ activeNote.date }}</span>
        </div>
      </div>

      <div class="note-content" v-html="renderedContent"></div>

      <footer class="site-footer">
        <button class="back-btn" @click="closeNote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回列表
        </button>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { marked } from 'marked';
import { knowledgeData } from './data-generated.js';

// Configure marked for clean output
marked.setOptions({
  breaks: false,
  gfm: true,
});

const notes = knowledgeData.notes;
const activeCategory = ref(null);
const activeNote = ref(null);
const visitCount = ref('加载中...');
const searchQuery = ref('');
const activeTag = ref(null); // 改为单选

const categories = knowledgeData.categories;

const uniqueDates = computed(() => {
  const dates = new Set(notes.map(n => n.date));
  return dates.size;
});

// 获取所有标签（按父标签分组）
const groupedTags = computed(() => {
  const groups = {};
  notes.forEach(note => {
    if (note.tags) {
      note.tags.forEach(tag => {
        const parts = tag.split('/');
        if (parts.length === 2) {
          const parentTag = parts[0];
          if (!groups[parentTag]) {
            groups[parentTag] = [];
          }
          if (!groups[parentTag].includes(tag)) {
            groups[parentTag].push(tag);
          }
        }
      });
    }
  });

  // 对每个分组内的标签排序
  for (const parentTag in groups) {
    groups[parentTag].sort();
  }

  return groups;
});

// 获取所有标签（扁平列表，用于搜索）
const allTags = computed(() => {
  const tags = [];
  for (const parentTag in groupedTags.value) {
    tags.push(...groupedTags.value[parentTag]);
  }
  return tags;
});

// 过滤笔记（分类 + 标签 + 搜索）
const filteredNotes = computed(() => {
  let result = notes;

  // 分类过滤
  if (activeCategory.value) {
    result = result.filter(n => n.category === activeCategory.value);
  }

  // 标签过滤（单选）
  if (activeTag.value) {
    result = result.filter(n => {
      if (!n.tags) return false;
      return n.tags.includes(activeTag.value);
    });
  }

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(n => {
      const titleMatch = n.title.toLowerCase().includes(query);
      const contentMatch = n.content.toLowerCase().includes(query);
      const tagMatch = n.tags && n.tags.some(tag => tag.toLowerCase().includes(query));
      return titleMatch || contentMatch || tagMatch;
    });
  }

  return result;
});

// 切换标签（单选）
function toggleTag(tag) {
  if (activeTag.value === tag) {
    activeTag.value = null; // 点击已选中的标签，取消选择
  } else {
    activeTag.value = tag; // 选择新标签
  }
}

// 获取标签显示名称（只显示子标签部分）
function getTagLabel(tag) {
  const parts = tag.split('/');
  return parts.length === 2 ? parts[1] : tag;
}

const renderedContent = computed(() => {
  if (!activeNote.value) return '';
  return marked(activeNote.value.content);
});

// ========== 路由系统 ==========

/**
 * 解析 hash 路由
 * 支持格式：
 * - #/ 或空 → 首页（全部笔记）
 * - #/category/{name} → 分类筛选
 * - #/note/{id} → 笔记详情
 */
function parseRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) {
    return { view: 'list', category: null };
  }

  if (parts[0] === 'category' && parts[1]) {
    return { view: 'list', category: parts[1] };
  }

  if (parts[0] === 'note' && parts[1]) {
    return { view: 'detail', noteId: parts[1] };
  }

  return { view: 'list', category: null };
}

/**
 * 根据 hash 更新应用状态
 */
function handleRouteChange() {
  const route = parseRoute(window.location.hash);

  if (route.view === 'list') {
    activeNote.value = null;
    activeCategory.value = route.category;
  } else if (route.view === 'detail') {
    // 根据 ID 查找笔记
    const note = notes.find(n => n.id === route.noteId);
    if (note) {
      activeNote.value = note;
      activeCategory.value = null;
    } else {
      // 找不到笔记，返回首页
      window.location.hash = '#/';
    }
  }
}

/**
 * 生成笔记的 URL hash
 */
function getNoteHash(note) {
  return `#/note/${note.id}`;
}

/**
 * 生成分类的 URL hash
 */
function getCategoryHash(category) {
  return category ? `#/category/${category}` : '#/';
}

// 获取访问次数
async function fetchVisitCount() {
  try {
    // 从 localStorage 读取
    const stored = localStorage.getItem('erzi-knowledge-visits');
    if (stored) {
      visitCount.value = parseInt(stored);
    } else {
      visitCount.value = 1;
    }

    // 递增计数
    const newCount = (parseInt(stored) || 0) + 1;
    localStorage.setItem('erzi-knowledge-visits', newCount.toString());
    visitCount.value = newCount;
  } catch (error) {
    console.error('访问统计加载失败:', error);
    visitCount.value = '统计不可用';
  }
}

onMounted(() => {
  fetchVisitCount();

  // 监听 hashchange 事件
  window.addEventListener('hashchange', handleRouteChange);

  // 初始化路由
  handleRouteChange();
});

onUnmounted(() => {
  window.removeEventListener('hashchange', handleRouteChange);
});

function openNote(note) {
  // 更新 hash，触发路由变化
  window.location.hash = getNoteHash(note);
  nextTick(() => window.scrollTo(0, 0));
}

function closeNote() {
  // 更新 hash，触发路由变化
  window.location.hash = getCategoryHash(activeCategory.value);
  nextTick(() => window.scrollTo(0, 0));
}

function setCategory(category) {
  activeCategory.value = category;
  // 更新 hash
  window.location.hash = getCategoryHash(category);
}
</script>
