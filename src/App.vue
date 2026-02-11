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
import { ref, computed, nextTick, onMounted } from 'vue';
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

// 获取访问次数
async function fetchVisitCount() {
  try {
    // 获取当前计数
    const getResponse = await fetch('https://api.countapi.xyz/get/erzi-knowledge/visits');
    if (getResponse.ok) {
      const data = await getResponse.json();
      visitCount.value = data.value;
    } else {
      // 如果计数器不存在，创建它
      const hitResponse = await fetch('https://api.countapi.xyz/hit/erzi-knowledge/visits');
      if (hitResponse.ok) {
        const data = await hitResponse.json();
        visitCount.value = data.value;
      }
    }
  } catch (error) {
    console.error('访问统计加载失败:', error);
    visitCount.value = '统计不可用';
  }
}

onMounted(() => {
  fetchVisitCount();
  // 记录一次访问
  fetch('https://api.countapi.xyz/hit/erzi-knowledge/visits').catch(() => {});
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
