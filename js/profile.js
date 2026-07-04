document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();

  const content = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Profile</h1>
        <p class="page-subtitle">Update your account details or change your password</p>
      </div>
    </div>
    <div class="card" style="max-width:640px">
      <form id="profileForm">
        <h3 class="section-title">Account Information</h3>
        <div class="form-group">
          <label class="form-label" for="name">Full Name</label>
          <input type="text" id="name" name="name" class="form-input" value="${escapeAttr(user?.name || '')}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input type="email" id="email" name="email" class="form-input" value="${escapeAttr(user?.email || '')}" required>
        </div>
        ${user?.created_at ? `<p class="task-desc" style="margin-bottom:1.5rem">Member since ${formatDate(user.created_at)}</p>` : ''}

        <h3 class="section-title">Change Password</h3>
        <div class="form-group">
          <label class="form-label" for="currentPassword">Current Password</label>
          <input type="password" id="currentPassword" name="currentPassword" class="form-input" placeholder="Required only when changing password">
        </div>
        <div class="form-group">
          <label class="form-label" for="password">New Password</label>
          <input type="password" id="password" name="password" class="form-input" placeholder="Min 6 chars with a number">
        </div>
        <div class="form-group">
          <label class="form-label" for="confirmPassword">Confirm New Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" class="form-input" placeholder="Repeat new password">
        </div>

        <button type="submit" class="btn btn-primary" id="submitBtn">Save Changes</button>
      </form>
    </div>
  `;

  initLayout('profile', content);

  document.getElementById('profileForm').addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  clearFormErrors(form);

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const currentPassword = form.currentPassword.value;
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  const submitBtn = document.getElementById('submitBtn');

  const nameErr = validateName(name);
  const emailErr = validateEmail(email);
  let passErr = '';
  let currentPassErr = '';
  let confirmErr = '';

  if (password || confirmPassword || currentPassword) {
    if (!currentPassword) currentPassErr = 'Current password is required to change password';
    passErr = validatePassword(password);
    confirmErr = validateConfirmPassword(password, confirmPassword);
  }

  showFieldError(form.name, nameErr);
  showFieldError(form.email, emailErr);
  showFieldError(form.currentPassword, currentPassErr);
  showFieldError(form.password, passErr);
  showFieldError(form.confirmPassword, confirmErr);

  if (nameErr || emailErr || passErr || currentPassErr || confirmErr) return;

  const payload = { name, email };
  if (password) {
    payload.password = password;
    payload.currentPassword = currentPassword;
  }

  setButtonLoading(submitBtn, true);
  try {
    const res = await authApi.updateProfile(payload);
    setAuth(getToken(), res.data.user);
    toastSuccess(res.message || 'Profile updated successfully');
    form.currentPassword.value = '';
    form.password.value = '';
    form.confirmPassword.value = '';
  } catch (err) {
    toastError(err.message || 'Update failed');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
