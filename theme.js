try {
  const savedTheme = localStorage.getItem('abhishek-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;
} catch (_) { /* Keep the default theme when storage is unavailable. */ }
