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
          @click="activeCategory = null"
        >全部</button>
        <button
          v-for="(info, key) in categories"
          :key="key"
          class="filter-btn"
          :class="{ active: activeCategory === key }"
          @click="activeCategory = key"
        >{{ info.label }}</button>
      </div>

      <!-- 搜索和标签过滤 -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索标题、内容或标签..."
          class="search-input"
        />
      </div>

      <div class="tag-cloud" v-if="allTags.length > 0">
        <span class="tag-label">标签：</span>
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag-btn"
          :class="{ active: activeTags.includes(tag) }"
          @click="toggleTag(tag)"
        >{{ tag }}</button>
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
            <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
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
import { ref, computed, nextTick, onMounted } from 'vue';
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
const activeTags = ref([]);

const categories = knowledgeData.categories;

const uniqueDates = computed(() => {
  const dates = new Set(notes.map(n => n.date));
  return dates.size;
});

// 获取所有标签
const allTags = computed(() => {
  const tags = new Set();
  notes.forEach(note => {
    if (note.tags) {
      note.tags.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
});

// 过滤笔记（分类 + 标签 + 搜索）
const filteredNotes = computed(() => {
  let result = notes;

  // 分类过滤
  if (activeCategory.value) {
    result = result.filter(n => n.category === activeCategory.value);
  }

  // 标签过滤
  if (activeTags.value.length > 0) {
    result = result.filter(n => {
      if (!n.tags) return false;
      return activeTags.value.every(tag => n.tags.includes(tag));
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

// 切换标签
function toggleTag(tag) {
  const index = activeTags.value.indexOf(tag);
  if (index > -1) {
    activeTags.value.splice(index, 1);
  } else {
    activeTags.value.push(tag);
  }
}

const renderedContent = computed(() => {
  if (!activeNote.value) return '';
  return marked(activeNote.value.content);
});

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
});

function openNote(note) {
  activeNote.value = note;
  nextTick(() => window.scrollTo(0, 0));
}

function closeNote() {
  activeNote.value = null;
  nextTick(() => window.scrollTo(0, 0));
}
</script>
