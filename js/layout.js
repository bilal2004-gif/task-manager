const NAV_ITEMS = [
  { href: '/dashboard.html', label: 'Dashboard', page: 'dashboard', icon: '🏠' },
  { href: '/create-task.html', label: 'Create Task', page: 'create-task', icon: '➕' },
  { href: '/edit-task.html', label: 'Edit Task', page: 'edit-task', icon: '✏️' },
  { href: '/profile.html', label: 'Profile', page: 'profile', icon: '👤' },
];

function renderAppLayout(activePage) {
  const user = getUser();
  const navLinks = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="nav-link ${item.page === activePage ? 'active' : ''}">
        <span>${item.icon}</span> ${item.label}
      </a>`
  ).join('');

  return `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">TaskManager</div>
      <nav class="sidebar-nav">${navLinks}</nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <strong>${user?.name || 'User'}</strong>
          <span>${user?.email || ''}</span>
        </div>
        <button type="button" class="btn btn-secondary btn-block" id="logoutBtn">Logout</button>
      </div>
    </aside>
    <div class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <button type="button" class="menu-btn" id="menuBtn" aria-label="Open menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <span class="page-title" style="font-size:1.1rem">TaskManager</span>
        </div>
        <button type="button" class="icon-btn" data-theme-toggle data-theme-icon aria-label="Toggle theme"></button>
      </header>
      <main class="page-content" id="pageContent"></main>
    </div>
  `;
}

function initLayout(activePage, contentHtml) {
  if (!requireAuth()) return;

  const shell = document.getElementById('app');
  shell.innerHTML = renderAppLayout(activePage);
  document.getElementById('pageContent').innerHTML = contentHtml;

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  document.getElementById('menuBtn')?.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  });

  overlay?.addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });

  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  bindThemeToggle();
  initTheme();
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('show');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

function statusBadge(status) {
  return `<span class="badge badge-${status}">${status.replace('_', ' ')}</span>`;
}

function priorityBadge(priority) {
  return `<span class="badge badge-${priority}">${priority}</span>`;
}
