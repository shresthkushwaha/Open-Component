import { Component, ComponentFile } from '../types';

export const STARTER_PROJECT_ID = 'starter-project-null';

export const getStarterFile = (): ComponentFile => ({
  id: STARTER_PROJECT_ID,
  name: 'Featured Collection',
  type: 'suite',
  createdAt: Date.now(),
  designSystem: {
    id: 'ds-featured',
    name: 'Featured',
    tokens: {
      primaryColor: '#000000',
      surfaceColor: '#ffffff',
      textColor: '#000000',
      fontDisplay: 'Inter',
      fontBody: 'Inter',
      radiusScale: 'soft',
      motionPreset: 'fluid'
    }
  }
});

export const getStarterComponents = (): Component[] => [
  {
    id: 'starter-comp-1',
    fileId: STARTER_PROJECT_ID,
    name: 'Kinetic Kanban Board',
    prompt: 'Create a minimal, kinetic kanban board with drag and drop interactions.',
    html: `
<div class="kanban-container">
  <div class="kanban-board">
    <div class="kanban-column" data-status="todo">
      <div class="column-header">
        <h2 id="col-1-title">To Do</h2>
        <span class="badge">3</span>
      </div>
      <div class="card-list">
        <div class="kanban-card" draggable="true">
          <div class="card-tag">Design</div>
          <p>Refine motion curves for the onboarding flow</p>
          <div class="card-footer">
            <div class="avatar"></div>
            <span class="priority">High</span>
          </div>
        </div>
        <div class="kanban-card" draggable="true">
          <div class="card-tag">Research</div>
          <p>User interviews for V2 dashboard</p>
          <div class="card-footer">
            <div class="avatar"></div>
            <span class="priority">Mid</span>
          </div>
        </div>
        <div class="kanban-card" draggable="true">
          <div class="card-tag">Content</div>
          <p>Update documentation for API hooks</p>
          <div class="card-footer">
            <div class="avatar"></div>
            <span class="priority">Low</span>
          </div>
        </div>
      </div>
    </div>
    <div class="kanban-column" data-status="progress">
      <div class="column-header">
        <h2 id="col-2-title">In Progress</h2>
        <span class="badge">1</span>
      </div>
      <div class="card-list">
        <div class="kanban-card" draggable="true">
          <div class="card-tag">Dev</div>
          <p>Implement drag and drop micro-interactions</p>
          <div class="card-footer">
            <div class="avatar"></div>
            <span class="priority">High</span>
          </div>
        </div>
      </div>
    </div>
    <div class="kanban-column" data-status="done">
      <div class="column-header">
        <h2 id="col-3-title">Done</h2>
        <span class="badge">0</span>
      </div>
      <div class="card-list"></div>
    </div>
  </div>
</div>`,
    css: `
:root {
  --bg-color: #f8fafc;
  --column-bg: #f1f5f9;
  --card-bg: #ffffff;
  --accent-color: #6366f1;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --card-radius: 12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  --shadow-lg: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}

.kanban-container {
  width: 100%;
  max-width: 1200px;
  padding: 40px;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: flex-start;
}

.kanban-column {
  background: var(--column-bg);
  border-radius: 16px;
  padding: 16px;
  min-height: 400px;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease;
  border: 2px solid transparent;
}

.kanban-column.drag-over {
  background: #e2e8f0;
  border: 2px dashed var(--accent-color);
  transform: translateY(-2px);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.column-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge {
  background: white;
  color: var(--text-muted);
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
}

.kanban-card {
  background: var(--card-bg);
  padding: 16px;
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-md);
  cursor: grab;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  user-select: none;
  border: 1px solid rgba(0,0,0,0.03);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.kanban-card.dragging {
  opacity: 0.4;
  transform: scale(0.95) rotate(2deg);
}

.card-tag {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--accent-color);
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.kanban-card p {
  font-size: 0.9rem;
  color: var(--text-main);
  line-height: 1.5;
  margin-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid white;
}

.priority {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 900px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}`,
    js: `
const cards = document.querySelectorAll('.kanban-card');
const columns = document.querySelectorAll('.kanban-column');

const updateBadges = () => {
  columns.forEach(col => {
    const badge = col.querySelector('.badge');
    const count = col.querySelectorAll('.kanban-card').length;
    badge.textContent = count;
    badge.style.transform = 'scale(1.2)';
    setTimeout(() => badge.style.transform = 'scale(1)', 200);
  });
};

cards.forEach(card => {
  card.addEventListener('dragstart', (e) => {
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', '');
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    columns.forEach(col => col.classList.remove('drag-over'));
    updateBadges();
  });
});

columns.forEach(column => {
  column.addEventListener('dragover', (e) => {
    e.preventDefault();
    column.classList.add('drag-over');
    
    const draggingCard = document.querySelector('.dragging');
    const list = column.querySelector('.card-list');
    const afterElement = getDragAfterElement(list, e.clientY);
    
    if (afterElement == null) {
      list.appendChild(draggingCard);
    } else {
      list.insertBefore(draggingCard, afterElement);
    }
  });

  column.addEventListener('dragleave', () => {
    column.classList.remove('drag-over');
  });

  column.addEventListener('drop', () => {
    column.classList.remove('drag-over');
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}`,
    timestamp: Date.now(),
    tags: ['interaction', 'kanban', 'gsap'],
    tweaks: [
      { id: 't1', label: 'To Do Title', type: 'text', property: '#col-1-title', value: 'To Do' },
      { id: 't2', label: 'In Progress Title', type: 'text', property: '#col-2-title', value: 'In Progress' },
      { id: 't3', label: 'Done Title', type: 'text', property: '#col-3-title', value: 'Done' },
      { id: 't4', label: 'Accent Color', type: 'color', property: '--accent-color', value: '#6366f1' }
    ]
  },
  {
    id: 'starter-comp-2',
    fileId: STARTER_PROJECT_ID,
    name: 'Ethereal Command Palette',
    prompt: 'Design an ethereal, high-fidelity command palette with search and keyboard navigation.',
    html: `
<div class="cp-overlay" id="palette-overlay">
  <div class="cp-modal" id="palette-modal">
    <div class="cp-search-container">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" id="cp-input" placeholder="Search commands..." autocomplete="off">
      <div class="cp-esc-hint">ESC</div>
    </div>

    <div class="cp-results" id="cp-results">
      <div class="cp-section">
        <div class="cp-section-label" id="recent-label">Recent</div>
        <div class="cp-item active" data-cmd="dashboard">
          <div class="cp-item-icon">📊</div>
          <div class="cp-item-content">
            <div class="cp-item-title">Go to Dashboard</div>
            <div class="cp-item-desc">View your project analytics</div>
          </div>
          <div class="cp-item-shortcut">G D</div>
        </div>
        <div class="cp-item" data-cmd="settings">
          <div class="cp-item-icon">⚙️</div>
          <div class="cp-item-content">
            <div class="cp-item-title">Account Settings</div>
            <div class="cp-item-desc">Manage preferences and security</div>
          </div>
          <div class="cp-item-shortcut">⌘ ,</div>
        </div>
      </div>

      <div class="cp-section">
        <div class="cp-section-label">Commands</div>
        <div class="cp-item" data-cmd="new-project">
          <div class="cp-item-icon">➕</div>
          <div class="cp-item-content">
            <div class="cp-item-title">Create New Project</div>
            <div class="cp-item-desc">Start a fresh workspace</div>
          </div>
          <div class="cp-item-shortcut">⌘ N</div>
        </div>
        <div class="cp-item" data-cmd="theme">
          <div class="cp-item-icon">🌓</div>
          <div class="cp-item-content">
            <div class="cp-item-title">Toggle Dark Mode</div>
            <div class="cp-item-desc">Switch between light and dark</div>
          </div>
          <div class="cp-item-shortcut">⌘ T</div>
        </div>
        <div class="cp-item" data-cmd="search-files">
          <div class="cp-item-icon">📂</div>
          <div class="cp-item-content">
            <div class="cp-item-title">Search Files</div>
            <div class="cp-item-desc">Locate files across folders</div>
          </div>
          <div class="cp-item-shortcut">⌘ P</div>
        </div>
      </div>
    </div>

    <div class="cp-footer">
      <div class="cp-footer-item"><span>↑↓</span> Navigate</div>
      <div class="cp-footer-item"><span>↵</span> Select</div>
      <div class="cp-footer-item"><span>K</span> Close</div>
    </div>
  </div>
</div>

<div class="cp-trigger-hint">
  Press <kbd>⌘</kbd> + <kbd>K</kbd> to open
</div>`,
    css: `
:root {
  --cp-bg: #0a0a0c;
  --cp-border: #222226;
  --cp-accent: #8b5cf6;
  --cp-text-main: #ffffff;
  --cp-text-muted: #88888e;
  --cp-item-hover: #16161a;
  --cp-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);
  --cp-radius: 14px;
}

.cp-trigger-hint {
  color: var(--cp-text-muted);
  font-size: 0.9rem;
  padding: 12px 20px;
  border: 1px solid var(--cp-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  animation: cp-pulse 2s infinite ease-in-out;
}

@keyframes cp-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.cp-trigger-hint kbd {
  background: var(--cp-border);
  color: var(--cp-text-main);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.8rem;
  margin: 0 2px;
}

.cp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.cp-overlay.visible {
  opacity: 1;
  pointer-events: auto;
}

.cp-modal {
  width: 100%;
  max-width: 640px;
  background: var(--cp-bg);
  border: 1px solid var(--cp-border);
  border-radius: var(--cp-radius);
  box-shadow: var(--cp-shadow);
  transform: translateY(20px) scale(0.98);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.cp-overlay.visible .cp-modal {
  transform: translateY(0) scale(1);
}

.cp-search-container {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--cp-border);
  gap: 12px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--cp-text-muted);
}

#cp-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--cp-text-main);
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 300;
}

.cp-esc-hint {
  font-size: 0.7rem;
  color: var(--cp-text-muted);
  padding: 4px 6px;
  border: 1px solid var(--cp-border);
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cp-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px 8px;
}

.cp-section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cp-text-muted);
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cp-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 2px;
}

.cp-item.active {
  background: var(--cp-item-hover);
  box-shadow: inset 0 0 0 1px var(--cp-border);
}

.cp-item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  font-size: 1.1rem;
}

.cp-item.active .cp-item-icon {
  background: var(--cp-accent);
  color: white;
}

.cp-item-content {
  flex: 1;
}

.cp-item-title {
  font-size: 0.95rem;
  color: var(--cp-text-main);
  font-weight: 500;
}

.cp-item-desc {
  font-size: 0.8rem;
  color: var(--cp-text-muted);
  margin-top: 2px;
}

.cp-item-shortcut {
  font-size: 0.75rem;
  color: var(--cp-text-muted);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0.5;
}

.cp-item.active .cp-item-shortcut {
  opacity: 1;
  color: var(--cp-accent);
}

.cp-footer {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid var(--cp-border);
  gap: 20px;
  background: rgba(0, 0, 0, 0.2);
}

.cp-footer-item {
  font-size: 0.75rem;
  color: var(--cp-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.cp-footer-item span {
  color: var(--cp-text-main);
  font-weight: 600;
  background: var(--cp-border);
  padding: 2px 4px;
  border-radius: 3px;
}`,
    js: `
const overlay = document.getElementById('palette-overlay');
const input = document.getElementById('cp-input');
const items = () => Array.from(document.querySelectorAll('.cp-item'));

function openPalette() {
  overlay.classList.add('visible');
  input.value = '';
  input.focus();
  filterItems('');
}

function closePalette() {
  overlay.classList.remove('visible');
  input.blur();
}

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    overlay.classList.contains('visible') ? closePalette() : openPalette();
  }
  
  if (!overlay.classList.contains('visible')) return;

  if (e.key === 'Escape') closePalette();

  const currentItems = items().filter(i => i.style.display !== 'none');
  const activeIndex = currentItems.findIndex(i => i.classList.contains('active'));

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentItems[activeIndex]?.classList.remove('active');
    const next = (activeIndex + 1) % currentItems.length;
    currentItems[next]?.classList.add('active');
    currentItems[next]?.scrollIntoView({ block: 'nearest' });
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentItems[activeIndex]?.classList.remove('active');
    const prev = (activeIndex - 1 + currentItems.length) % currentItems.length;
    currentItems[prev]?.classList.add('active');
    currentItems[prev]?.scrollIntoView({ block: 'nearest' });
  }

  if (e.key === 'Enter') {
    const active = currentItems[activeIndex];
    if (active) {
      active.style.background = 'var(--cp-accent)';
      setTimeout(() => {
        closePalette();
        active.style.background = '';
      }, 200);
    }
  }
});

input.addEventListener('input', (e) => {
  filterItems(e.target.value);
});

function filterItems(query) {
  const q = query.toLowerCase();
  let firstVisible = null;

  items().forEach(item => {
    const title = item.querySelector('.cp-item-title').innerText.toLowerCase();
    const desc = item.querySelector('.cp-item-desc').innerText.toLowerCase();
    
    if (title.includes(q) || desc.includes(q)) {
      item.style.display = 'flex';
      item.classList.remove('active');
      if (!firstVisible) firstVisible = item;
    } else {
      item.style.display = 'none';
    }
  });

  if (firstVisible) firstVisible.classList.add('active');

  document.querySelectorAll('.cp-section').forEach(section => {
    const hasVisible = Array.from(section.querySelectorAll('.cp-item')).some(i => i.style.display !== 'none');
    section.style.display = hasVisible ? 'block' : 'none';
  });
}

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closePalette();
});

items().forEach(item => {
  item.addEventListener('click', () => closePalette());
  item.addEventListener('mouseenter', () => {
    items().forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});`,
    timestamp: Date.now(),
    tags: ['ui', 'palette', 'premium'],
    tweaks: [
      { id: 't1', label: 'Search Placeholder', type: 'text', property: '#cp-input', value: 'Search commands...' },
      { id: 't2', label: 'Accent Color', type: 'color', property: '--cp-accent', value: '#8b5cf6' },
      { id: 't3', label: 'Background', type: 'color', property: '--cp-bg', value: '#0a0a0c' }
    ]
  },
  {
    id: 'starter-comp-3',
    fileId: STARTER_PROJECT_ID,
    name: 'Nebula Kitty Cursor',
    prompt: 'Create a kinetic feline cursor that reacts to mouse movement and clicks.',
    html: `
<div class="fixed inset-0 overflow-hidden bg-[#0a0a0c] selection:bg-[#ff80a8]/30">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3a3a4d] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

  <div class="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
    <h1 id="title-text" class="text-6xl md:text-8xl font-extrabold text-white tracking-tighter mb-4 opacity-0">
      THE KINETIC<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ff80a8] to-[#a18cd1]">FELINE.</span>
    </h1>
    <p class="text-gray-400 max-w-md text-lg leading-relaxed opacity-0" id="sub-text">
      Experience a cursor that breathes. Click anywhere to drop a digital treat and watch the kitty react.
    </p>
    
    <div class="mt-12 flex gap-4 opacity-0" id="cta-container">
      <button class="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-transform tracking-wide">
        HOVER ME
      </button>
      <button class="px-8 py-4 border border-white/10 text-white font-bold rounded-full hover:bg-white/5 transition-colors tracking-wide">
        EXPLORE
      </button>
    </div>
  </div>

  <div id="cat-cursor" class="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform">
    <div class="relative w-24 h-24">
      <div id="cat-shadow" class="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 blur-md rounded-full"></div>
      
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <path id="cat-tail" d="M85 65 Q 95 55 90 35" stroke="var(--cat-color)" stroke-width="8" stroke-linecap="round" fill="none" />
        <ellipse id="cat-body-svg" cx="50" cy="60" rx="35" ry="28" fill="var(--cat-color)" />
        <path d="M22 42 L 15 15 L 45 35 Z" fill="var(--cat-color)" />
        <path d="M78 42 L 85 15 L 55 35 Z" fill="var(--cat-color)" />
        <path d="M25 38 L 20 22 L 38 34 Z" fill="var(--cat-accent)" />
        <path d="M75 38 L 80 22 L 62 34 Z" fill="var(--cat-accent)" />
        <g id="cat-eyes">
           <circle cx="38" cy="55" r="3.5" fill="#1a1a1a" />
           <circle cx="62" cy="55" r="3.5" fill="#1a1a1a" />
           <rect id="eye-blink" x="30" y="50" width="40" height="10" fill="var(--cat-color)" class="opacity-0" />
        </g>
        <path d="M47 62 Q 50 64 53 62" stroke="var(--cat-accent)" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <circle cx="30" cy="62" r="4" fill="var(--cat-accent)" fill-opacity="0.4" />
        <circle cx="70" cy="62" r="4" fill="var(--cat-accent)" fill-opacity="0.4" />
      </svg>
    </div>
  </div>
</div>`,
    css: `
:root {
  --cat-color: #f8f9fa;
  --cat-accent: #ff80a8;
}

body {
  cursor: none !important;
  background-color: #0a0a0c;
  overflow: hidden;
}

#cat-cursor {
  transform-origin: center center;
}

.treat-particle {
  position: fixed;
  pointer-events: none;
  z-index: 9998;
  filter: drop-shadow(0 0 10px var(--cat-accent));
}

button {
  cursor: none !important;
}`,
    js: `
import gsap from 'gsap';

const cursor = document.querySelector('#cat-cursor');
const tail = document.querySelector('#cat-tail');
const eyes = document.querySelector('#eye-blink');
const bodySvg = document.querySelector('#cat-body-svg');

let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let pos = { x: mouse.x, y: mouse.y };
let vel = { x: 0, y: 0 };
let isSqueezing = false;

gsap.to("#title-text", { y: 0, opacity: 1, duration: 1, delay: 0.5 });
gsap.to("#sub-text", { y: 0, opacity: 1, duration: 1, delay: 0.7 });
gsap.to("#cta-container", { y: 0, opacity: 1, duration: 1, delay: 0.9 });

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

gsap.ticker.add(() => {
  const fp = 0.12;
  const dx = mouse.x - pos.x;
  const dy = mouse.y - pos.y;
  pos.x += dx * fp;
  pos.y += dy * fp;
  vel.x = dx * 0.1;
  gsap.set(cursor, {
    x: pos.x - 48,
    y: pos.y - 48,
    rotation: gsap.utils.clamp(-20, 20, vel.x),
    scaleY: isSqueezing ? 0.7 : (1 / (1 + Math.min(Math.sqrt(dx*dx + dy*dy) / 1000, 0.2)))
  });
});

gsap.to(tail, { duration: 1.2, attr: { d: "M85 65 Q 105 50 88 30" }, repeat: -1, yoyo: true, ease: "sine.inOut" });

const blink = () => {
  gsap.to(eyes, { opacity: 1, duration: 0.1, onComplete: () => gsap.to(eyes, { opacity: 0, duration: 0.1, delay: 0.1 }) });
  setTimeout(blink, Math.random() * 3000 + 2000);
};
blink();

window.addEventListener('mousedown', () => {
  isSqueezing = true;
  gsap.to(cursor, { scaleX: 1.3, scaleY: 0.7, duration: 0.2, ease: "back.out(2)" });
  const treat = document.createElement('div');
  treat.className = 'treat-particle text-2xl';
  treat.innerText = ['🧶', '🐟', '✨', '🥛'][Math.floor(Math.random() * 4)];
  treat.style.left = \`\${pos.x - 12}px\`;
  treat.style.top = \`\${pos.y + 20}px\`;
  document.body.appendChild(treat);
  gsap.to(treat, { y: "+=80", rotation: Math.random() * 360, opacity: 0, duration: 1, ease: "power2.in", onComplete: () => treat.remove() });
});

window.addEventListener('mouseup', () => {
  isSqueezing = false;
  gsap.to(cursor, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.3)" });
});

document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('mouseenter', () => gsap.to(bodySvg, { fill: "#a18cd1", duration: 0.3 }));
  btn.addEventListener('mouseleave', () => gsap.to(bodySvg, { fill: "var(--cat-color)", duration: 0.3 }));
});`,
    timestamp: Date.now(),
    tags: ['cursor', 'animation', 'gsap'],
    tweaks: [
      { id: 't1', label: 'Title Text', type: 'text', property: '#title-text', value: 'THE KINETIC NEBULA' },
      { id: 't2', label: 'Cat Primary', type: 'color', property: '--cat-color', value: '#f8f9fa' },
      { id: 't3', label: 'Cat Accent', type: 'color', property: '--cat-accent', value: '#ff80a8' }
    ]
  },
  {
    id: 'starter-comp-4',
    fileId: STARTER_PROJECT_ID,
    name: 'Ethereal Flip Card',
    prompt: 'Create a premium, 3D flipping credit card with high-fidelity textures.',
    html: `
<div class="component-wrapper">
  <div class="card-container">
    <div class="card-inner">
      <div class="card-face card-front">
        <div class="card-top">
          <svg class="chip" width="40" height="32" viewBox="0 0 40 32" fill="none">
            <rect width="40" height="32" rx="4" fill="#e0e0e0"/>
            <path d="M0 11H12V21H0V11Z" stroke="#a0a0a0" stroke-width="0.5"/>
            <path d="M28 11H40V21H28V11Z" stroke="#a0a0a0" stroke-width="0.5"/>
            <path d="M12 0V11M12 21V32M28 0V11M28 21V32" stroke="#a0a0a0" stroke-width="0.5"/>
            <rect x="12" y="11" width="16" height="10" rx="1" stroke="#a0a0a0" stroke-width="0.5"/>
          </svg>
          <div class="visa-logo">
            <svg viewBox="0 0 100 32" width="60"><path d="M36.1 2.3h-6.1c-1.1 0-2.1.6-2.6 1.6l-9.1 21.6h6.4l1.3-3.6h7.8l.7 3.6h5.7L36.1 2.3zm-5 14.5l2.7-7.4 1.5 7.4h-4.2zm-21.2-14.5l-6.1 14.9-.6-3.1c-1-3.5-4.2-7.3-7.8-9.1l-.1-.1v19h6.4V9.6l9.8 15.9h6.4L23.4 2.3h-6.5l-.1-.1z" fill="currentColor"/></svg>
          </div>
        </div>
        <div class="card-middle">
          <div id="card-number" class="number-display">•••• •••• •••• 8842</div>
        </div>
        <div class="card-bottom">
          <div class="info-group">
            <span class="label">Card Holder</span>
            <span id="card-name" class="value">ALEXANDER RIVERA</span>
          </div>
          <div class="info-group">
            <span class="label">Expires</span>
            <span id="card-expiry" class="value">12/26</span>
          </div>
        </div>
      </div>
      <div class="card-face card-back">
        <div class="magnetic-stripe"></div>
        <div class="signature-area">
          <div class="signature-strip"><div class="sig-lines"></div></div>
          <div id="card-cvv" class="cvv-display">421</div>
        </div>
        <div class="back-content">
          <p class="disclaimer">This card is property of the issuing bank. Subject to terms and conditions.</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
    css: `
:root {
  --radius: 16px;
  --card-bg: #000000;
  --card-text: #ffffff;
}

.component-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.card-container {
  width: 400px;
  height: 250px;
  perspective: 1200px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1);
  transform-style: preserve-3d;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  border-radius: var(--radius);
}

.card-container:hover .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--card-bg);
  color: var(--card-text);
  border: 1px solid rgba(255,255,255,0.1);
}

.card-face::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
}

.card-back { transform: rotateY(180deg); padding: 0; }
.chip { opacity: 0.9; }
.number-display { font-family: monospace; font-size: 22px; letter-spacing: 2px; margin-top: 10px; }
.label { font-size: 8px; text-transform: uppercase; opacity: 0.6; }
.value { font-size: 14px; font-weight: 500; }
.magnetic-stripe { width: 100%; height: 45px; background: #1a1a1a; margin-top: 24px; }
.signature-area { margin: 20px 24px; display: flex; align-items: center; gap: 12px; }
.signature-strip { flex-grow: 1; height: 36px; background: #f0f0f0; border-radius: 4px; }
.cvv-display { font-family: monospace; background: white; color: black; padding: 4px 8px; }
.back-content { padding: 24px; margin-top: auto; }
.disclaimer { font-size: 7px; opacity: 0.4; }`,
    js: ``,
    timestamp: Date.now(),
    tags: ['3d', 'interaction', 'card'],
    tweaks: [
      { id: 't1', label: 'Card Name', type: 'text', property: '#card-name', value: 'ALEXANDER RIVERA' },
      { id: 't2', label: 'Card Number', type: 'text', property: '#card-number', value: '•••• •••• •••• 8842' },
      { id: 't3', label: 'Expiry Date', type: 'text', property: '#card-expiry', value: '12/26' },
      { id: 't4', label: 'Card Color', type: 'color', property: '--card-bg', value: '#000000' }
    ]
  }
];

