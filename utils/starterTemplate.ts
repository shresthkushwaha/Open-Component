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
      primaryColor: '#a7e5d3', // Mint Accent
      surfaceColor: '#ffffff',
      textColor: '#0f172a',    // Deep Slate
      fontDisplay: 'Outfit',
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
  <div class="kanban-header">
    <h1 id="board-title">Product Roadmap</h1>
    <p id="board-desc">Strategic development and feature tracking</p>
  </div>
  <div class="kanban-board">
    <div class="kanban-column" data-status="todo">
      <div class="column-header">
        <h2 id="col-1-title">Discovery</h2>
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
        <h2 id="col-2-title">Development</h2>
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
        <h2 id="col-3-title">Shipped</h2>
        <span class="badge">0</span>
      </div>
      <div class="card-list"></div>
    </div>
  </div>
</div>`,
    css: `
:root {
  --bg-color: #ffffff;
  --column-bg: #f8fafb;
  --card-bg: #ffffff;
  --accent-color: #a7e5d3;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --card-radius: 16px;
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
  --shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 8px 24px -4px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 32px 64px -12px rgba(15, 23, 42, 0.12);
}

.kanban-container {
  width: 100%;
  max-width: 1200px;
  padding: 60px 40px;
  background: var(--bg-color);
  font-family: var(--font-body);
}

.kanban-header {
  margin-bottom: 40px;
}

.kanban-header h1 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.kanban-header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: flex-start;
}

.kanban-column {
  background: var(--column-bg);
  border-radius: 24px;
  padding: 20px;
  min-height: 500px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(15, 23, 42, 0.04);
}

.kanban-column.drag-over {
  background: #f1f5f9;
  border-color: var(--accent-color);
  transform: translateY(-4px);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.column-header h2 {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.02em;
}

.badge {
  background: var(--accent-color);
  color: var(--text-main);
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100px;
}

.kanban-card {
  background: var(--card-bg);
  padding: 20px;
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-md);
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  user-select: none;
  border: 1px solid rgba(15, 23, 42, 0.04);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-color);
}

.kanban-card.dragging {
  opacity: 0.5;
  transform: scale(0.95) rotate(2deg);
}

.card-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-main);
  background: var(--accent-color);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kanban-card p {
  font-size: 1rem;
  color: var(--text-main);
  line-height: 1.6;
  margin-bottom: 20px;
  font-weight: 450;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(15, 23, 42, 0.04);
  padding-top: 16px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 100px;
  background: #e2e8f0;
  border: 2px solid white;
}

.priority {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
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
    tags: ['interaction', 'kanban', 'editorial'],
    tweaks: [
      { id: 't1', label: 'Main Title', type: 'text', property: '#board-title', value: 'Product Roadmap' },
      { id: 't2', label: 'Description', type: 'text', property: '#board-desc', value: 'Strategic development and feature tracking' },
      { id: 't3', label: 'Accent Color', type: 'color', property: '--accent-color', value: '#a7e5d3' }
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
      <input type="text" id="cp-input" placeholder="What can I help you find?" autocomplete="off">
      <div class="cp-esc-hint">ESC</div>
    </div>

    <div class="cp-results" id="cp-results">
      <div class="cp-section">
        <div class="cp-section-label" id="recent-label">Activity</div>
        <div class="cp-item active" data-cmd="dashboard">
          <div class="cp-item-icon">📊</div>
          <div class="cp-item-content">
            <div class="cp-item-title">Visual Analytics</div>
            <div class="cp-item-desc">Review your interaction metrics</div>
          </div>
          <div class="cp-item-shortcut">⌘ A</div>
        </div>
        <div class="cp-item" data-cmd="settings">
          <div class="cp-item-icon">⚙️</div>
          <div class="cp-item-content">
            <div class="cp-item-title">System Configuration</div>
            <div class="cp-item-desc">Adjust performance and UI tokens</div>
          </div>
          <div class="cp-item-shortcut">⌘ S</div>
        </div>
      </div>

      <div class="cp-section">
        <div class="cp-section-label">Commands</div>
        <div class="cp-item" data-cmd="new-project">
          <div class="cp-item-icon">➕</div>
          <div class="cp-item-content">
            <div class="cp-item-title">New Workspace</div>
            <div class="cp-item-desc">Initialize a clean environment</div>
          </div>
          <div class="cp-item-shortcut">⌘ N</div>
        </div>
        <div class="cp-item" data-cmd="theme">
          <div class="cp-item-icon">🌓</div>
          <div class="cp-item-content">
            <div class="cp-item-title">Toggle Appearance</div>
            <div class="cp-item-desc">Switch between light and dark modes</div>
          </div>
          <div class="cp-item-shortcut">⌘ T</div>
        </div>
      </div>
    </div>

    <div class="cp-footer">
      <div class="cp-footer-item"><span>↑↓</span> Browse</div>
      <div class="cp-footer-item"><span>↵</span> Execute</div>
      <div class="cp-footer-item"><span>K</span> Close</div>
    </div>
  </div>
</div>

<div class="cp-trigger-container">
  <div class="cp-trigger-hint">
    Press <kbd>⌘</kbd> + <kbd>K</kbd> to activate command palette
  </div>
</div>`,
    css: `
:root {
  --cp-bg: #ffffff;
  --cp-border: rgba(15, 23, 42, 0.08);
  --cp-accent: #a7e5d3;
  --cp-text-main: #0f172a;
  --cp-text-muted: #64748b;
  --cp-item-hover: #f8fafb;
  --cp-shadow: 0 32px 128px -12px rgba(15, 23, 42, 0.15);
  --cp-radius: 20px;
  --font-main: 'Outfit', sans-serif;
}

.cp-trigger-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.cp-trigger-hint {
  color: var(--cp-text-muted);
  font-family: var(--font-main);
  font-size: 1rem;
  padding: 16px 28px;
  border: 1px solid var(--cp-border);
  border-radius: 100px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  cursor: pointer;
}

.cp-trigger-hint:hover {
  transform: translateY(-2px);
  border-color: var(--cp-accent);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.cp-trigger-hint kbd {
  background: #f1f5f9;
  color: var(--cp-text-main);
  padding: 4px 10px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  margin: 0 4px;
  font-weight: 600;
}

.cp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.cp-overlay.visible {
  opacity: 1;
  pointer-events: auto;
}

.cp-modal {
  width: 100%;
  max-width: 680px;
  background: var(--cp-bg);
  border: 1px solid var(--cp-border);
  border-radius: var(--cp-radius);
  box-shadow: var(--cp-shadow);
  transform: translateY(30px) scale(0.95);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  font-family: var(--font-main);
}

.cp-overlay.visible .cp-modal {
  transform: translateY(0) scale(1);
}

.cp-search-container {
  display: flex;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid var(--cp-border);
  gap: 16px;
}

.search-icon {
  width: 24px;
  height: 24px;
  color: var(--cp-accent);
}

#cp-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--cp-text-main);
  font-family: inherit;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.cp-esc-hint {
  font-size: 0.7rem;
  color: var(--cp-text-muted);
  padding: 4px 8px;
  border: 1px solid var(--cp-border);
  border-radius: 6px;
  font-weight: 700;
}

.cp-results {
  max-height: 480px;
  overflow-y: auto;
  padding: 16px;
}

.cp-section-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--cp-text-muted);
  padding: 12px 16px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cp-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 4px;
}

.cp-item.active {
  background: var(--cp-item-hover);
  transform: translateX(4px);
}

.cp-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafb;
  border-radius: 12px;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.cp-item.active .cp-item-icon {
  background: var(--cp-accent);
  transform: scale(1.1);
}

.cp-item-content {
  flex: 1;
}

.cp-item-title {
  font-size: 1.05rem;
  color: var(--cp-text-main);
  font-weight: 600;
}

.cp-item-desc {
  font-size: 0.85rem;
  color: var(--cp-text-muted);
  margin-top: 2px;
}

.cp-item-shortcut {
  font-size: 0.8rem;
  color: var(--cp-text-muted);
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.cp-item.active .cp-item-shortcut {
  background: white;
  color: var(--cp-text-main);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.cp-footer {
  display: flex;
  align-items: center;
  padding: 16px 28px;
  border-top: 1px solid var(--cp-border);
  gap: 28px;
  background: #fcfcfd;
}

.cp-footer-item {
  font-size: 0.8rem;
  color: var(--cp-text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.cp-footer-item span {
  color: var(--cp-text-main);
  font-weight: 700;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--cp-border);
}`,
    js: `
const overlay = document.getElementById('palette-overlay');
const input = document.getElementById('cp-input');
const items = () => Array.from(document.querySelectorAll('.cp-item'));

function openPalette() {
  overlay.classList.add('visible');
  input.value = '';
  input.focus();
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

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closePalette();
});

items().forEach(item => {
  item.addEventListener('mouseenter', () => {
    items().forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});`,
    timestamp: Date.now(),
    tags: ['ui', 'palette', 'premium'],
    tweaks: [
      { id: 't1', label: 'Search Placeholder', type: 'text', property: '#cp-input', value: 'What can I help you find?' },
      { id: 't2', label: 'Accent Color', type: 'color', property: '--cp-accent', value: '#a7e5d3' },
      { id: 't3', label: 'Surface', type: 'color', property: '--cp-bg', value: '#ffffff' }
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
        <div class="card-glass-shine"></div>
        <div class="card-top">
          <svg class="chip" width="44" height="36" viewBox="0 0 40 32" fill="none">
            <rect width="40" height="32" rx="6" fill="#f8fafc" opacity="0.9"/>
            <path d="M0 11H12V21H0V11Z" stroke="#0f172a" stroke-width="0.5" opacity="0.1"/>
            <path d="M28 11H40V21H28V11Z" stroke="#0f172a" stroke-width="0.5" opacity="0.1"/>
            <path d="M12 0V11M12 21V32M28 0V11M28 21V32" stroke="#0f172a" stroke-width="0.5" opacity="0.1"/>
          </svg>
          <div class="visa-logo">
            <span id="card-brand-name">ETHEREAL</span>
          </div>
        </div>
        <div class="card-middle">
          <div id="card-number" class="number-display">•••• •••• •••• 8842</div>
        </div>
        <div class="card-bottom">
          <div class="info-group">
            <span class="label">Member</span>
            <span id="card-name" class="value">ALEXANDER RIVERA</span>
          </div>
          <div class="info-group">
            <span class="label">Valid Thru</span>
            <span id="card-expiry" class="value">12 / 28</span>
          </div>
        </div>
      </div>
      <div class="card-face card-back">
        <div class="magnetic-stripe"></div>
        <div class="signature-area">
          <div class="signature-strip"></div>
          <div id="card-cvv" class="cvv-display">421</div>
        </div>
        <div class="back-content">
          <p class="disclaimer">Issued by Open Component Systems. This asset is strictly digital and strictly premium.</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
    css: `
:root {
  --radius: 24px;
  --card-bg: #0f172a;
  --card-accent: #a7e5d3;
  --card-text: #ffffff;
  --font-main: 'Outfit', sans-serif;
}

.component-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  background: white;
  font-family: var(--font-main);
}

.card-container {
  width: 440px;
  height: 270px;
  perspective: 2000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  transform-style: preserve-3d;
}

.card-container:hover .card-inner {
  transform: rotateY(180deg) rotateX(5deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--radius);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--card-bg);
  color: var(--card-text);
  box-shadow: 0 40px 80px -15px rgba(15, 23, 42, 0.3);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-glass-shine {
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    45deg,
    transparent 45%,
    rgba(255, 255, 255, 0.05) 48%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.05) 52%,
    transparent 55%
  );
  transition: all 0.8s ease;
  pointer-events: none;
}

.card-container:hover .card-glass-shine {
  top: -50%;
  left: -50%;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#card-brand-name {
  font-weight: 800;
  letter-spacing: 0.3em;
  font-size: 0.8rem;
  color: var(--card-accent);
}

.number-display {
  font-family: 'Courier New', monospace;
  font-size: 1.75rem;
  letter-spacing: 0.15em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.label {
  font-size: 0.65rem;
  text-transform: uppercase;
  opacity: 0.5;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
  display: block;
}

.value {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.card-back {
  transform: rotateY(180deg);
  padding: 0;
  background: #0a101e;
}

.magnetic-stripe {
  width: 100%;
  height: 56px;
  background: #000;
  margin-top: 32px;
}

.signature-area {
  margin: 24px 32px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.signature-strip {
  flex-grow: 1;
  height: 44px;
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px);
}

.cvv-display {
  font-family: monospace;
  background: white;
  color: #0f172a;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 700;
}

.back-content {
  padding: 0 32px 32px;
}

.disclaimer {
  font-size: 0.6rem;
  opacity: 0.3;
  line-height: 1.5;
}`,
    js: ``,
    timestamp: Date.now(),
    tags: ['3d', 'interaction', 'card'],
    tweaks: [
      { id: 't1', label: 'Card Name', type: 'text', property: '#card-name', value: 'ALEXANDER RIVERA' },
      { id: 't2', label: 'Brand Name', type: 'text', property: '#card-brand-name', value: 'ETHEREAL' },
      { id: 't3', label: 'Accent Color', type: 'color', property: '--card-accent', value: '#a7e5d3' },
      { id: 't4', label: 'Card Color', type: 'color', property: '--card-bg', value: '#0f172a' }
    ]
  }
];
