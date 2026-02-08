import * as d3 from 'd3';
import { knowledgeNodes, categoryColors, categoryLabels } from './data.js';

// 全局变量
let svg, simulation, nodeGroup, linkGroup;
let width, height;
let currentFilter = 'all';

// 初始化
function init() {
  width = window.innerWidth;
  height = window.innerHeight;

  // 创建 SVG
  svg = d3.select('#app')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#0a0e17');

  // 创建缩放容器
  const g = svg.append('g');

  // 创建连线组
  linkGroup = g.append('g').attr('class', 'links');

  // 创建节点组
  nodeGroup = g.append('g').attr('class', 'nodes');

  // 创建力导向图
  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(50));

  // 添加缩放
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // 渲染
  render('all');
  updateStats('all');

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    svg.attr('width', width).attr('height', height);
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.alpha(1).restart();
  });
}

// 渲染知识地图
function render(filter) {
  currentFilter = filter;

  // 过滤节点
  const filteredNodes = filter === 'all'
    ? knowledgeNodes
    : knowledgeNodes.filter(d => d.category === filter);

  // 创建简单的关系（基于分类和时间）
  const links = [];
  for (let i = 0; i < filteredNodes.length; i++) {
    for (let j = i + 1; j < filteredNodes.length; j++) {
      const nodeA = filteredNodes[i];
      const nodeB = filteredNodes[j];

      // 同分类的节点连接
      if (nodeA.category === nodeB.category) {
        links.push({
          source: nodeA.id,
          target: nodeB.id,
        });
      }
    }
  }

  // 更新连线
  const link = linkGroup.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#2d375b')
    .attr('stroke-width', 1)
    .attr('opacity', 0.3);

  // 更新节点
  const node = nodeGroup.selectAll('g')
    .data(filteredNodes, d => d.id)
    .join(
      enter => {
        const g = enter.append('g')
          .attr('class', 'node')
          .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));

        // 添加圆形
        g.append('circle')
          .attr('r', 20)
          .attr('fill', d => categoryColors[d.category])
          .attr('stroke', '#e8f4fc')
          .attr('stroke-width', 2)
          .attr('cursor', 'pointer')
          .on('click', (event, d) => showModal(d));

        // 添加标签
        g.append('text')
          .text(d => d.title.length > 8 ? d.title.substring(0, 8) + '...' : d.title)
          .attr('dy', 35)
          .attr('text-anchor', 'middle')
          .attr('fill', '#e8f4fc')
          .attr('font-size', '10px')
          .attr('pointer-events', 'none');
      },
      update => {
        update.select('circle')
          .attr('fill', d => categoryColors[d.category]);
        update.select('text')
          .text(d => d.title.length > 8 ? d.title.substring(0, 8) + '...' : d.title);
      },
      exit => exit.remove()
    );

  // 更新仿真
  simulation
    .nodes(filteredNodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(150))
    .on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });
}

// 拖拽事件
function dragStarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragEnded(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// 显示模态框
function showModal(node) {
  const modal = document.getElementById('modal');
  const overlay = document.getElementById('overlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalMeta = document.getElementById('modalMeta');
  const modalContent = document.getElementById('modalContent');

  modalTitle.textContent = node.title;
  modalMeta.textContent = `${categoryLabels[node.category]} | ${node.date}`;
  modalContent.textContent = node.content;

  modal.classList.add('show');
  overlay.classList.add('show');
}

// 隐藏模态框
function hideModal() {
  document.getElementById('modal').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}

// 更新统计信息
function updateStats(filter) {
  const stats = document.getElementById('stats');
  const count = filter === 'all'
    ? knowledgeNodes.length
    : knowledgeNodes.filter(d => d.category === filter).length;
  stats.textContent = `共 ${knowledgeNodes.length} 篇笔记，当前显示 ${count} 篇`;
}

// 过滤按钮事件
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (event) => {
    const filter = event.target.dataset.filter;

    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    // 重新渲染
    render(filter);
    updateStats(filter);
  });
});

// 关闭模态框事件
document.getElementById('modalClose').addEventListener('click', hideModal);
document.getElementById('overlay').addEventListener('click', hideModal);

// 启动
init();
