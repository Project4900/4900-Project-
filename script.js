console.log("WeatherEase App loaded");

// Replace with your API key
const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32";

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
  const status = document.getElementById('current-status');

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

  // --- Geolocation button ---
  document.getElementById('geo-btn')?.addEventListener('click', () => {
    status.textContent = 'Getting your location…';
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation not supported by your browser.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => { status.textContent = 'Unable to get location.'; }
    );
  });

  // --- Search form ---
  document.getElementById('location-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = document.getElementById('search').value.trim();
    if (city) fetchWeatherByCity(city);
  });

  // --- Functions ---
  async function fetchWeatherByCity(city) {
    try {
      status.textContent = 'Fetching weather…';
      const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`);
      if (!currentRes.ok) throw new Error('City not found');
      const currentData = await currentRes.json();

      updateCurrentWeather(currentData);

      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${API_KEY}`);
      if (!forecastRes.ok) throw new Error('Forecast not found');
      const forecastData = await forecastRes.json();

      updateForecast(forecastData);

      status.textContent = 'Weather loaded successfully!';
    } catch(err) {
      console.error(err);
      status.textContent = 'Error fetching weather. Please try again.';
    }
  }

  async function fetchWeatherByCoords(lat, lon) {
    try {
      status.textContent = 'Fetching weather…';
      const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
      if (!currentRes.ok) throw new Error('Location weather not found');
      const currentData = await currentRes.json();

      updateCurrentWeather(currentData);

      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
      if (!forecastRes.ok) throw new Error('Forecast not found');
      const forecastData = await forecastRes.json();

      updateForecast(forecastData);

      status.textContent = 'Weather loaded successfully!';
    } catch(err) {
      console.error(err);
      status.textContent = 'Error fetching weather. Please try again.';
    }
  }

  function updateCurrentWeather(data) {
    document.querySelector('[data-field="place"]').textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('[data-field="temp"]').textContent = `${Math.round(data.main.temp)}°F`;
    document.querySelector('[data-field="feels"]').textContent = `${Math.round(data.main.feels_like)}°F`;
    document.querySelector('[data-field="desc"]').textContent = data.weather[0].description;
    document.querySelector('[data-field="humidity"]').textContent = `${data.main.humidity}%`;
    document.querySelector('[data-field="wind"]').textContent = `${Math.round(data.wind.speed)} mph`;
  }

  function updateForecast(forecastData) {
    const forecastList = document.querySelectorAll('#forecast-list li');
    let dayCount = 0;
    const seenDays = new Set();

    forecastData.list.forEach(item => {
      const date = new Date(item.dt_txt);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const hour = date.getHours();

      if (hour === 12 && !seenDays.has(dayName) && dayCount < forecastList.length) {
        seenDays.add(dayName);
        const li = forecastList[dayCount];
        li.querySelector('[data-day]').textContent = dayName;
        li.querySelector('[data-high]').textContent = `${Math.round(item.main.temp_max)}°F`;
        li.querySelector('[data-low]').textContent = `${Math.round(item.main.temp_min)}°F`;
        li.querySelector('[data-desc]').textContent = item.weather[0].main;
        dayCount++;
      }
    });

    // Fill remaining empty days if any (max 5 days available)
    for (let i = dayCount; i < forecastList.length; i++) {
      const li = forecastList[i];
      li.querySelector('[data-day]').textContent = '—';
      li.querySelector('[data-high]').textContent = '—';
      li.querySelector('[data-low]').textContent = '—';
      li.querySelector('[data-desc]').textContent = '—';
    }
  }
});



