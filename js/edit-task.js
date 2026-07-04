document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get('id');

  if (!taskId) {
    showSearchPage();
    return;
  }

  await loadEditForm(taskId);
});

function showSearchPage() {
  const content = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Task</h1>
        <p class="page-subtitle">Search for a task using its Task ID</p>
      </div>
    </div>
    <div class="card" style="max-width:480px">
      <form id="searchTaskForm">
        <div class="form-group">
          <label class="form-label" for="taskIdInput">Task ID</label>
          <input type="number" id="taskIdInput" name="taskId" class="form-input" min="1" placeholder="Enter your Task ID (e.g. 1)" required>
          <p class="task-desc" style="margin-top:0.5rem">Find Task IDs on the Dashboard or after creating a task.</p>
        </div>
        <button type="submit" class="btn btn-primary" id="searchBtn">Find & Edit Task</button>
      </form>
    </div>
  `;

  initLayout('edit-task', content);

  document.getElementById('searchTaskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('taskIdInput');
    const id = input.value.trim();
    const searchBtn = document.getElementById('searchBtn');

    if (!id || parseInt(id, 10) < 1) {
      showFieldError(input, 'Enter a valid Task ID');
      return;
    }

    setButtonLoading(searchBtn, true);
    try {
      await taskApi.getById(id);
      window.location.href = `/edit-task.html?id=${id}`;
    } catch (err) {
      showFieldError(input, err.message || 'Task not found');
      toastError(err.message || 'Task not found');
    } finally {
      setButtonLoading(searchBtn, false);
    }
  });
}

async function loadEditForm(taskId) {
  initLayout('edit-task', '<div class="page-loader"><div class="spinner"></div></div>');

  try {
    const res = await taskApi.getById(taskId);
    const task = res.data.task;

    const content = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Edit Task <span class="task-id">#${task.id}</span></h1>
          <p class="page-subtitle">Update task details</p>
        </div>
      </div>
      <div class="card" style="max-width:640px">${getTaskFormHtml(task)}</div>
    `;

    document.getElementById('pageContent').innerHTML = content;

    bindTaskForm(async (payload) => {
      try {
        await taskApi.update(taskId, payload);
        toastSuccess(`Task #${taskId} updated successfully`);
        setTimeout(() => { window.location.href = '/dashboard.html'; }, 500);
      } catch (err) {
        toastError(err.message || 'Failed to update task');
        throw err;
      }
    }, 'Save Changes');
  } catch (err) {
    toastError(err.message || 'Task not found');
    setTimeout(() => { window.location.href = '/edit-task.html'; }, 1000);
  }
}
