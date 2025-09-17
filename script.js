console.log("WeatherEase App loaded");

const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32";
const PRO_ENDPOINT = "https://pro.openweathermap.org/data/2.5";

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
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

  // --- Helper: Fetch weather ---
  async function fetchWeather(lat, lon, units = 'metric') {
    try {
      status.textContent = 'Fetching weather data...';

      // Current weather
      const currentResp = await fetch(`${PRO_ENDPOINT}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`);
      if (!currentResp.ok) throw new Error("Current weather request failed");
      const currentData = await currentResp.json();

      document.querySelector('[data-field="place"]').textContent = `${currentData.name}, ${currentData.sys.country}`;
      document.querySelector('[data-field="temp"]').textContent = `${Math.round(currentData.main.temp)}°`;
      document.querySelector('[data-field="feels"]').textContent = `${Math.round(currentData.main.feels_like)}°`;
      document.querySelector('[data-field="desc"]').textContent = currentData.weather[0].description;
      document.querySelector('[data-field="humidity"]').textContent = `${currentData.main.humidity}%`;
      document.querySelector('[data-field="wind"]').textContent = `${currentData.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}`;

      // Daily forecast (5 days using 3-hour API -> we pick 1 per day)
      const forecastResp = await fetch(`${PRO_ENDPOINT}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`);
      if (!forecastResp.ok) throw new Error("Forecast request failed");
      const forecastData = await forecastResp.json();

      const days = document.querySelectorAll('#forecast-list li');
      for (let i = 0; i < days.length; i++) {
        const item = days[i];
        const daily = forecastData.list[i*8]; // approx every 24 hours (3h * 8 = 24h)
        if (!daily) break;
        const date = new Date(daily.dt * 1000);
        const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
        item.querySelector('[data-day]').textContent = dayName;
        item.querySelector('[data-high]').textContent = `${Math.round(daily.main.temp_max)}°`;
        item.querySelector('[data-low]').textContent = `${Math.round(daily.main.temp_min)}°`;
        item.querySelector('[data-desc]').textContent = daily.weather[0].description;
      }

      status.textContent = 'Weather updated successfully.';
    } catch (err) {
      console.error(err);
      status.textContent = 'Error fetching location. Check spelling or try again.';
      document.querySelector('[data-field="place"]').textContent = '—';
      document.querySelector('[data-field="temp"]').textContent = '—';
      document.querySelector('[data-field="feels"]').textContent = '—';
      document.querySelector('[data-field="desc"]').textContent = '—';
      document.querySelector('[data-field="humidity"]').textContent = '—';
      document.querySelector('[data-field="wind"]').textContent = '—';
      document.querySelectorAll('#forecast-list li').forEach(li => {
        li.querySelector('[data-day]').textContent = '—';
        li.querySelector('[data-high]').textContent = '—';
        li.querySelector('[data-low]').textContent = '—';
        li.querySelector('[data-desc]').textContent = '—';
      });
    }
  }

  // --- Geolocation ---
  document.getElementById('geo-btn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation not supported by your browser.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, getUnits()),
      err => status.textContent = 'Unable to get location.'
    );
  });

  // --- Form Search ---
  document.getElementById('location-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const searchVal = document.getElementById('search').value.trim();
    if (!searchVal) return;

    try {
      status.textContent = 'Geocoding location...';
      // Geocoding API to get lat/lon
      const geoResp = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchVal)}&limit=1&appid=${API_KEY}`);
      if (!geoResp.ok) throw new Error('Geocoding failed');
      const geoData = await geoResp.json();
      if (!geoData[0]) throw new Error('Location not found');

      const { lat, lon } = geoData[0];
      fetchWeather(lat, lon, getUnits());
    } catch (err) {
      console.error(err);
      status.textContent = 'Error fetching location. Check spelling.';
    }
  });

  function getUnits() {
    const unitsSelect = document.getElementById('units');
    const val = unitsSelect?.value || 'metric';
    return val === 'auto' ? 'metric' : val;
  }
});
