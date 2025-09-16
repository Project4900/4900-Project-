console.log("WeatherEase App loaded");

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle (make sure you add <input type="checkbox" id="dark-mode"> in HTML)
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
    const searchVal = document.getElementById('search').value.trim();
    if (searchVal) {
      document.querySelector('[data-field="place"]').textContent = searchVal;
    }
    // Fill current conditions with placeholder data
    document.querySelector('[data-field="temp"]').textContent = '72°F';
    document.querySelector('[data-field="feels"]').textContent = '75°F';
    document.querySelector('[data-field="desc"]').textContent = 'Partly cloudy';
    document.querySelector('[data-field="humidity"]').textContent = '50%';
    document.querySelector('[data-field="wind"]').textContent = '5 mph';
    status.textContent = 'Displaying placeholder weather data.';
    
    // Fill 7-day forecast placeholders
    const days = document.querySelectorAll('#forecast-list li');
    const dummyForecast = [
      {day:'Mon', high:'75°F', low:'60°F', desc:'Sunny'},
      {day:'Tue', high:'78°F', low:'62°F', desc:'Partly Cloudy'},
      {day:'Wed', high:'80°F', low:'65°F', desc:'Sunny'},
      {day:'Thu', high:'77°F', low:'63°F', desc:'Rain'},
      {day:'Fri', high:'74°F', low:'61°F', desc:'Cloudy'},
      {day:'Sat', high:'76°F', low:'62°F', desc:'Sunny'},
      {day:'Sun', high:'79°F', low:'64°F', desc:'Thunderstorms'},
    ];
    days.forEach((li, i) => {
      li.querySelector('[data-day]').textContent = dummyForecast[i].day;
      li.querySelector('[data-high]').textContent = dummyForecast[i].high;
      li.querySelector('[data-low]').textContent = dummyForecast[i].low;
      li.querySelector('[data-desc]').textContent = dummyForecast[i].desc;
    });
  });
});
