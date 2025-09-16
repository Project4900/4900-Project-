console.log("WeatherEase App loaded");

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle
  const darkModeCheckbox = document.getElementById('dark-mode');
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    if (darkModeCheckbox) darkModeCheckbox.checked = true;
  }
  if (darkModeCheckbox) {
    darkModeCheckbox.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode', darkModeCheckbox.checked);
      localStorage.setItem('darkMode', darkModeCheckbox.checked);
    });
  }

  // Accessibility toggles
  const big = document.getElementById('big-text');
  const contrast = document.getElementById('high-contrast');
  const voice = document.getElementById('voice');
  const status = document.getElementById('current-status');

  big?.addEventListener('change', () => {
    document.documentElement.style.fontSize = big.checked ? '18px' : '';
  });

  contrast?.addEventListener('change', () => {
    document.body.style.filter = contrast.checked ? 'contrast(1.2)' : '';
  });

  voice?.addEventListener('change', () => {
    status.textContent = voice.checked
      ? 'Voice commands enabled (placeholder).'
      : 'Voice commands disabled.';
  });

  // Geolocation button
  document.getElementById('geo-btn')?.addEventListener('click', () => {
    status.textContent = 'Getting your location…';
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation not supported by your browser.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        document.querySelector('[data-field="place"]').textContent = 
          `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
        status.textContent = 'Location received. Replace with real weather fetch.';
      },
      (err) => {
        status.textContent = 'Unable to get location.';
      }
    );
  });

  // Search form
  document.getElementById('location-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Searching… Replace this with an API request.';
    const searchVal = document.getElementById('search').value.trim();
    if (searchVal) {
      document.querySelector('[data-field="place"]').textContent = searchVal;
    }
  });
})();
