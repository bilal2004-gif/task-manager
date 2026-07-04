document.addEventListener('DOMContentLoaded', () => {
  if (redirectIfAuth()) return;

  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const email = form.email.value.trim();
    const password = form.password.value;

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    showFieldError(form.email, emailErr);
    showFieldError(form.password, passErr);
    if (emailErr || passErr) return;

    setButtonLoading(submitBtn, true);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.token, res.data.user);
      toastSuccess('Welcome back!');
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 500);
    } catch (err) {
      toastError(err.message || 'Login failed');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
});
