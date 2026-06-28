document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  if (!themeToggleBtn) return;

  // Retrieve saved theme preference, or fall back to system preferences
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

  // Set initial theme state and aria-pressed attributes
  if (isDarkMode) {
    document.body.classList.add('dark-theme');
    themeToggleBtn.setAttribute('aria-pressed', 'true');
  } else {
    document.body.classList.remove('dark-theme');
    themeToggleBtn.setAttribute('aria-pressed', 'false');
  }

  // Toggle theme click listener
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    // Save selection to localStorage
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    themeToggleBtn.setAttribute('aria-pressed', currentTheme === 'dark' ? 'true' : 'false');
  });
});
