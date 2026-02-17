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

      <div class="filter-bar">
        <button
          class="filter-btn"
          :class="{ active: activeCategory === null }"
          @click="setCategory(null)"
        >全部</button>
        <button
          v-for="(info, key) in categories"
          :key="key"
          class="filter-btn"
          :class="{ active: activeCategory === key }"
          @click="setCategory(key)"
        >{{ info.label }}</button>
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
        </div>
      </div>

      <div class="empty-state" v-else>
        暂无笔记
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
const categories = knowledgeData.categories;

const activeCategory = ref(null);
const activeNote = ref(null);
const visitCount = ref('加载中...');

const uniqueDates = computed(() => {
  const dates = new Set(notes.map(n => n.date));
  return dates.size;
});

const filteredNotes = computed(() => {
  if (!activeCategory.value) return notes;
  return notes.filter(n => n.category === activeCategory.value);
});

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
