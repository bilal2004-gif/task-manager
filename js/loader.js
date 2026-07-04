function initLoader() {
  if (!document.getElementById('global-loader')) {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
  }
}

function showLoader() {
  initLoader();
  document.getElementById('global-loader').classList.add('show');
}

function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.remove('show');
}

function setButtonLoading(button, loading) {
  if (!button) return;
  button.disabled = loading;
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner spinner-sm"></span>';
  } else if (button.dataset.originalText) {
    button.innerHTML = button.dataset.originalText;
  }
}
