console.log("WeatherEase App loaded");

// Your OpenWeatherMap API key
const apiKey = "2c1fb322de5c86e87d6eb7e265fe9f32";

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

  // Function to fetch weather
  async function fetchWeather(location) {
    try {
      status.textContent = 'Fetching weather…';
      // Determine units based on selection
      const unitsSelect = document.getElementById('units');
      const units = unitsSelect ? unitsSelect.value : 'metric';
      const tempUnit = units === 'imperial' ? '°F' : '°C';
      const speedUnit = units === 'imperial' ? 'mph' : 'm/s';

      // Get coordinates (search by city name)
      const geoResp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${units}`
      );
      if (!geoResp.ok) throw new Error('Location not found');
      const data = await geoResp.json();

      // Update current conditions
      document.querySelector('[data-field="place"]').textContent = `${data.name}, ${data.sys.country}`;
      document.querySelector('[data-field="temp"]').textContent = `${Math.round(data.main.temp)}${tempUnit}`;
      document.querySelector('[data-field="feels"]').textContent = `${Math.round(data.main.feels_like)}${tempUnit}`;
      document.querySelector('[data-field="desc"]').textContent = data.weather[0].description;
      document.querySelector('[data-field="humidity"]').textContent = `${data.main.humidity}%`;
      document.querySelector('[data-field="wind"]').textContent = `${data.wind.speed} ${speedUnit}`;

      // Fetch 7-day forecast using One Call API
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      const forecastResp = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=${units}`
      );
      if (!forecastResp.ok) throw new Error('Failed to fetch forecast');
      const forecastData = await forecastResp.json();

      // Update forecast
      const days = document.querySelectorAll('#forecast-list li');
      days.forEach((li, i) => {
        if (forecastData.daily[i]) {
          const dayData = forecastData.daily[i];
          const date = new Date(dayData.dt * 1000);
          const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
          li.querySelector('[data-day]').textContent = dayName;
          li.querySelector('[data-high]').textContent = `${Math.round(dayData.temp.max)}${tempUnit}`;
          li.querySelector('[data-low]').textContent = `${Math.round(dayData.temp.min)}${tempUnit}`;
          li.querySelector('[data-desc]').textContent = `${dayData.weather[0].main} • ${Math.round(dayData.wind_speed)} ${speedUnit}`;
        }
      });

      status.textContent = 'Weather data loaded successfully.';
    } catch (err) {
      console.error(err);
      status.textContent = `Error: ${err.message}`;
    }
  }

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
        fetchWeather(`${latitude},${longitude}`);
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
      fetchWeather(searchVal);
    }
  });
});

