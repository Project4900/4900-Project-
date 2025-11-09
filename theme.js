// =========================
// WeatherEase Theme Handler
// Applies Dark Mode, Big Text, High Contrast globally
// =========================

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------
  // Read user preferences
  // ----------------------------
  const darkMode = localStorage.getItem('darkMode') === 'true';
  const bigText = localStorage.getItem('bigText') === 'true';
  const highContrast = localStorage.getItem('highContrast') === 'true';

  // ----------------------------
  // Apply Dark Mode
  // ----------------------------
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }

  // ----------------------------
  // Apply Big Text
  // ----------------------------
  if (bigText) {
    document.documentElement.style.fontSize = '18px';
  }

  // ----------------------------
  // Apply High Contrast
  // ----------------------------
  if (highContrast) {
    document.body.style.filter = 'contrast(1.2)';
  }
});
