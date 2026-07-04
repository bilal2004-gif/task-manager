export function validateEmail(email) {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
  return '';
}

export function validatePassword(password, { required = true, minLength = 6 } = {}) {
  if (!password) return required ? 'Password is required' : '';
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return '';
}

export function validateName(name) {
  if (!name.trim()) return 'Name is required';
  if (name.length > 100) return 'Name is too long';
  return '';
}

export function validateTaskTitle(title) {
  if (!title.trim()) return 'Title is required';
  if (title.length > 200) return 'Title is too long';
  return '';
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
}
