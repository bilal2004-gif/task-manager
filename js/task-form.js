function getTaskFormHtml(initial = {}) {
  const dueDate = initial.due_date ? initial.due_date.split('T')[0] : '';
  return `
    <form id="taskForm">
      <div class="form-group">
        <label class="form-label" for="title">Title *</label>
        <input type="text" id="title" name="title" class="form-input" value="${escapeAttr(initial.title || '')}" placeholder="Task title" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="description">Description</label>
        <textarea id="description" name="description" class="form-textarea" placeholder="Task details (optional)">${escapeHtml(initial.description || '')}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="status">Status</label>
          <select id="status" name="status" class="form-select">
            <option value="pending" ${initial.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in_progress" ${initial.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${initial.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="priority">Priority</label>
          <select id="priority" name="priority" class="form-select">
            <option value="low" ${initial.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${(initial.priority || 'medium') === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${initial.priority === 'high' ? 'selected' : ''}>High</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="due_date">Due Date</label>
        <input type="date" id="due_date" name="due_date" class="form-input" value="${dueDate}">
      </div>
      <div class="form-actions">
        <a href="/dashboard.html" class="btn btn-secondary">Cancel</a>
        <button type="submit" class="btn btn-primary" id="submitBtn">SUBMIT_LABEL</button>
      </div>
    </form>
  `;
}

function bindTaskForm(onSubmit, submitLabel) {
  const form = document.getElementById('taskForm');
  form.querySelector('#submitBtn').textContent = submitLabel;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const title = form.title.value.trim();
    const titleErr = validateTaskTitle(title);
    showFieldError(form.title, titleErr);
    if (titleErr) return;

    const payload = {
      title,
      description: form.description.value.trim(),
      status: form.status.value,
      priority: form.priority.value,
      due_date: form.due_date.value ? new Date(form.due_date.value).toISOString() : null,
    };

    const submitBtn = document.getElementById('submitBtn');
    setButtonLoading(submitBtn, true);
    try {
      await onSubmit(payload);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
