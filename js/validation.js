function validateEmail(email) {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
  return '';
}

function validatePassword(password, required = true) {
  if (!password) return required ? 'Password is required' : '';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return '';
}

function validateName(name) {
  if (!name.trim()) return 'Name is required';
  if (name.length > 100) return 'Name is too long';
  return '';
}

function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return '';
}

function validateTaskTitle(title) {
  if (!title.trim()) return 'Title is required';
  if (title.length > 200) return 'Title is too long';
  return '';
}

function showFieldError(input, message) {
  const group = input.closest('.form-group');
  const existing = group.querySelector('.form-error');
  if (existing) existing.remove();

  if (message) {
    input.classList.add('error');
    const err = document.createElement('p');
    err.className = 'form-error';
    err.textContent = message;
    group.appendChild(err);
  } else {
    input.classList.remove('error');
  }
}

function clearFormErrors(form) {
  form.querySelectorAll('.form-error').forEach((el) => el.remove());
  form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
}
