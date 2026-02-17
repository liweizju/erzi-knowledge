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

      <!-- 洞见报告专区（置顶） -->
      <section class="insights-section" v-if="insightsNotes.length > 0 && !activeCategory && !activeTag && !searchQuery">
        <div class="section-header">
          <h2 class="section-title">💡 洞见报告</h2>
          <span class="section-count">{{ insightsNotes.length }} 篇</span>
        </div>
        <div class="insights-grid">
          <div
            v-for="note in insightsNotes.slice(0, 3)"
            :key="note.id"
            class="insight-card"
            @click="openNote(note)"
          >
            <div class="insight-date">{{ note.date }}</div>
            <h3 class="insight-title">{{ note.title }}</h3>
            <p class="insight-summary" v-if="note.summary">{{ note.summary }}</p>
            <div class="insight-tags" v-if="note.tags && note.tags.length > 0">
              <span v-for="tag in note.tags.slice(0, 2)" :key="tag" class="tag">{{ getTagLabel(tag) }}</span>
            </div>
          </div>
        </div>
        <button v-if="insightsNotes.length > 3" class="view-all-btn" @click="activeCategory = 'insights'">
          查看全部 {{ insightsNotes.length }} 篇洞见 →
        </button>
      </section>

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

          <!-- 日记入口（特色区域） -->
          <div class="diary-featured" v-if="diaryNotes.length > 0 && !activeCategory && !activeTag && !searchQuery">
            <div class="diary-header">
              <span class="diary-icon">📔</span>
              <span class="diary-label">二子日记</span>
              <span class="diary-count">{{ diaryNotes.length }} 篇</span>
            </div>
            <div class="diary-preview">
              <div class="diary-latest" @click="openNote(diaryNotes[0])">
                <span class="diary-date">{{ diaryNotes[0].date }}</span>
                <span class="diary-title">{{ diaryNotes[0].title }}</span>
              </div>
              <button class="diary-more" @click="activeCategory = 'diary'">全部日记 →</button>
            </div>
          </div>

          <!-- 笔记列表（不含洞见和日记） -->
          <div class="note-list" v-if="displayNotes.length">
            <div class="list-header" v-if="activeCategory || activeTag || searchQuery">
              <span class="list-filter-label">
                <template v-if="activeCategory">{{ categories[activeCategory]?.label }}</template>
                <template v-else-if="activeTag">{{ getTagLabel(activeTag) }}</template>
                <template v-else-if="searchQuery">搜索: {{ searchQuery }}</template>
              </span>
              <button class="clear-filter-btn" @click="clearFilters">清除筛选</button>
            </div>
            <div
              v-for="note in displayNotes"
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
const activeTag = ref(null);

const categories = knowledgeData.categories;

const uniqueDates = computed(() => {
  const dates = new Set(notes.map(n => n.date));
  return dates.size;
});

// 洞见报告列表
const insightsNotes = computed(() => {
  return notes.filter(n => n.category === 'insights')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 日记列表
const diaryNotes = computed(() => {
  return notes.filter(n => n.category === 'diary')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 其他笔记（不含洞见和日记）
const otherNotes = computed(() => {
  return notes.filter(n => n.category !== 'insights' && n.category !== 'diary');
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

  for (const parentTag in groups) {
    groups[parentTag].sort();
  }

  return groups;
});

// 显示的笔记列表
const displayNotes = computed(() => {
  let result;

  // 如果有筛选条件，显示全部笔记
  if (activeCategory.value || activeTag.value || searchQuery.value.trim()) {
    result = notes;
  } else {
    // 首页：只显示其他笔记（不含洞见和日记）
    result = otherNotes.value;
  }

  // 分类过滤
  if (activeCategory.value) {
    result = result.filter(n => n.category === activeCategory.value);
  }

  // 标签过滤
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

function toggleTag(tag) {
  if (activeTag.value === tag) {
    activeTag.value = null;
  } else {
    activeTag.value = tag;
  }
}

function clearFilters() {
  activeCategory.value = null;
  activeTag.value = null;
  searchQuery.value = '';
}

function getTagLabel(tag) {
  const parts = tag.split('/');
  return parts.length === 2 ? parts[1] : tag;
}

const renderedContent = computed(() => {
  if (!activeNote.value) return '';
  return marked(activeNote.value.content);
});

// ========== 路由系统 ==========

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

function handleRouteChange() {
  const route = parseRoute(window.location.hash);

  if (route.view === 'list') {
    activeNote.value = null;
    activeCategory.value = route.category;
  } else if (route.view === 'detail') {
    const note = notes.find(n => n.id === route.noteId);
    if (note) {
      activeNote.value = note;
      activeCategory.value = null;
    } else {
      window.location.hash = '#/';
    }
  }
}

function getNoteHash(note) {
  return `#/note/${note.id}`;
}

function getCategoryHash(category) {
  return category ? `#/category/${category}` : '#/';
}

async function fetchVisitCount() {
  try {
    const stored = localStorage.getItem('erzi-knowledge-visits');
    if (stored) {
      visitCount.value = parseInt(stored);
    } else {
      visitCount.value = 1;
    }
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
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
});

onUnmounted(() => {
  window.removeEventListener('hashchange', handleRouteChange);
});

function openNote(note) {
  window.location.hash = getNoteHash(note);
  nextTick(() => window.scrollTo(0, 0));
}

function closeNote() {
  window.location.hash = getCategoryHash(activeCategory.value);
  nextTick(() => window.scrollTo(0, 0));
}
</script>
