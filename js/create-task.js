document.addEventListener('DOMContentLoaded', () => {
  const content = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Create Task</h1>
        <p class="page-subtitle">Add a new task — a unique Task ID will be assigned to you</p>
      </div>
    </div>
    <div id="createTaskArea">
      <div class="card" style="max-width:640px" id="taskFormCard">${getTaskFormHtml()}</div>
    </div>
  `;

  initLayout('create-task', content);

  bindTaskForm(async (payload) => {
    try {
      const res = await taskApi.create(payload);
      const task = res.data.task;
      toastSuccess(`Task created! Your Task ID is #${task.id}`);
      showCreatedTask(task);
    } catch (err) {
      toastError(err.message || 'Failed to create task');
      throw err;
    }
  }, 'Create Task');
});

function showCreatedTask(task) {
  document.getElementById('createTaskArea').innerHTML = `
    <div class="card success-card" style="max-width:640px">
      <div class="success-icon">✅</div>
      <h2>Task Created Successfully</h2>
      <p class="task-desc">Save this ID to search or edit your task later.</p>
      <div class="task-id-display">Task ID: <strong>#${task.id}</strong></div>
      <ul class="task-summary">
        <li><span>Title</span><strong>${escapeHtml(task.title)}</strong></li>
        <li><span>Status</span>${statusBadge(task.status)}</li>
        <li><span>Priority</span>${priorityBadge(task.priority)}</li>
        ${task.due_date ? `<li><span>Due Date</span><strong>${formatDate(task.due_date)}</strong></li>` : ''}
      </ul>
      <div class="form-actions" style="margin-top:1.5rem">
        <a href="/create-task.html" class="btn btn-secondary">Create Another</a>
        <a href="/edit-task.html?id=${task.id}" class="btn btn-secondary">Edit Task</a>
        <a href="/dashboard.html" class="btn btn-primary">Go to Dashboard</a>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
