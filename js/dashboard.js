let deletingId = null;
let currentPage = 1;
const PAGE_SIZE = 10;

document.addEventListener('DOMContentLoaded', async () => {
  const content = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Overview of your tasks</p>
      </div>
      <a href="/create-task.html" class="btn btn-primary">+ New Task</a>
    </div>
    <div class="stats-grid" id="statsGrid">
      <div class="page-loader"><div class="spinner"></div></div>
    </div>
    <div class="card">
      <div class="filters">
        <input type="search" id="searchInput" class="form-input" placeholder="Search by Task ID, title, or description...">
        <select id="statusFilter" class="form-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select id="priorityFilter" class="form-select">
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div id="tasksContainer">
        <div class="page-loader"><div class="spinner"></div></div>
      </div>
      <div id="pagination" class="pagination"></div>
    </div>
  `;

  initLayout('dashboard', content);

  document.getElementById('searchInput').addEventListener('input', debounce(() => {
    currentPage = 1;
    loadTasks();
  }, 400));
  document.getElementById('statusFilter').addEventListener('change', () => {
    currentPage = 1;
    loadTasks();
  });
  document.getElementById('priorityFilter').addEventListener('change', () => {
    currentPage = 1;
    loadTasks();
  });

  await loadDashboard();
});

async function loadDashboard() {
  await Promise.all([loadStats(), loadTasks()]);
}

async function loadStats() {
  try {
    const res = await taskApi.getStats();
    const s = res.data.stats;
    document.getElementById('statsGrid').innerHTML = `
      <div class="card stat-card"><div class="stat-icon blue">📋</div><div><p class="stat-label">Total Tasks</p><p class="stat-value">${s.total || 0}</p></div></div>
      <div class="card stat-card"><div class="stat-icon yellow">⏳</div><div><p class="stat-label">Pending</p><p class="stat-value">${s.pending || 0}</p></div></div>
      <div class="card stat-card"><div class="stat-icon indigo">⚡</div><div><p class="stat-label">In Progress</p><p class="stat-value">${s.in_progress || 0}</p></div></div>
      <div class="card stat-card"><div class="stat-icon green">✅</div><div><p class="stat-label">Completed</p><p class="stat-value">${s.completed || 0}</p></div></div>
      <div class="card stat-card"><div class="stat-icon red">🔥</div><div><p class="stat-label">High Priority</p><p class="stat-value">${s.high_priority || 0}</p></div></div>
    `;
  } catch (err) {
    toastError(err.message || 'Failed to load stats');
  }
}

async function loadTasks() {
  const container = document.getElementById('tasksContainer');
  container.innerHTML = '<div class="page-loader"><div class="spinner"></div></div>';

  const params = { page: currentPage, limit: PAGE_SIZE };
  const search = document.getElementById('searchInput').value.trim();
  const status = document.getElementById('statusFilter').value;
  const priority = document.getElementById('priorityFilter').value;
  if (search) params.search = search;
  if (status) params.status = status;
  if (priority) params.priority = priority;

  try {
    const res = await taskApi.getAll(params);
    renderTasks(res.data.tasks);
    renderPagination(res.data.pagination);
  } catch (err) {
    container.innerHTML = `<p class="empty-state">${err.message || 'Failed to load tasks'}</p>`;
    document.getElementById('pagination').innerHTML = '';
    toastError(err.message || 'Failed to load tasks');
  }
}

function renderTasks(tasks) {
  const container = document.getElementById('tasksContainer');

  if (!tasks.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No tasks found. Try a different search or create a new task.</p>
        <a href="/create-task.html" class="btn btn-primary">Create Task</a>
      </div>`;
    return;
  }

  const desktopRows = tasks.map((task) => `
    <tr>
      <td><span class="task-id">#${task.id}</span></td>
      <td>
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      </td>
      <td>${statusBadge(task.status)}</td>
      <td>${priorityBadge(task.priority)}</td>
      <td>${formatDate(task.due_date)}</td>
      <td>
        <div class="table-actions">
          <a href="/edit-task.html?id=${task.id}">Edit</a>
          <button type="button" class="delete-btn" data-id="${task.id}" style="color:var(--danger)">
            ${deletingId === task.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const mobileCards = tasks.map((task) => `
    <div class="card task-card-mobile">
      <div class="task-card-header">
        <span class="task-id">#${task.id}</span>
        <h3 class="task-title">${escapeHtml(task.title)}</h3>
      </div>
      ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
      <div>${statusBadge(task.status)} ${priorityBadge(task.priority)}</div>
      ${task.due_date ? `<p class="task-desc">Due: ${formatDate(task.due_date)}</p>` : ''}
      <div class="card-actions">
        <a href="/edit-task.html?id=${task.id}" class="btn btn-secondary">Edit</a>
        <button type="button" class="btn btn-danger delete-btn" data-id="${task.id}">
          ${deletingId === task.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="desktop-table table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>ID</th><th>Title</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Actions</th></tr>
        </thead>
        <tbody>${desktopRows}</tbody>
      </table>
    </div>
    <div class="mobile-cards">${mobileCards}</div>
  `;

  container.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.id));
  });
}

function renderPagination(pagination) {
  const el = document.getElementById('pagination');
  if (!pagination || pagination.totalPages <= 1) {
    el.innerHTML = pagination?.total
      ? `<p class="pagination-info">Showing ${pagination.total} task${pagination.total !== 1 ? 's' : ''}</p>`
      : '';
    return;
  }

  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  let pages = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages += `<button type="button" class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === page - 2 || i === page + 2) {
      pages += '<span class="page-dots">...</span>';
    }
  }

  el.innerHTML = `
    <p class="pagination-info">Showing ${start}–${end} of ${total} tasks</p>
    <div class="pagination-controls">
      <button type="button" class="page-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Prev</button>
      ${pages}
      <button type="button" class="page-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;

  el.querySelectorAll('.page-btn[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.page, 10);
      if (next >= 1 && next <= totalPages && next !== currentPage) {
        currentPage = next;
        loadTasks();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  deletingId = id;
  await loadTasks();

  try {
    await taskApi.delete(id);
    toastSuccess('Task deleted');
    await loadDashboard();
  } catch (err) {
    toastError(err.message || 'Delete failed');
  } finally {
    deletingId = null;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
