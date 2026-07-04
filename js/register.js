document.addEventListener('DOMContentLoaded', () => {
  if (redirectIfAuth()) return;

  const form = document.getElementById('registerForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    const errors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };

    showFieldError(form.name, errors.name);
    showFieldError(form.email, errors.email);
    showFieldError(form.password, errors.password);
    showFieldError(form.confirmPassword, errors.confirmPassword);

    if (Object.values(errors).some(Boolean)) return;

    setButtonLoading(submitBtn, true);
    try {
      const res = await authApi.register({ name, email, password });
      toastSuccess('Account created successfully! Please login.');
      setTimeout(() => { window.location.href = '/login.html'; }, 1000);
    } catch (err) {
      toastError(err.message || 'Registration failed');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
});
