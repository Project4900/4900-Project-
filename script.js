console.log("WeatherEase App loaded");

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32"; // OpenWeatherMap key

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
      ? 'Voice commands enabled.'
      : 'Voice commands disabled.';
  });

  // Helper: fetch weather by coordinates
  async function fetchWeather(lat, lon, units='metric') {
    try {
      status.textContent = 'Fetching weather…';
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      // Update current
      document.querySelector('[data-field="place"]').textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
      document.querySelector('[data-field="temp"]').textContent = `${Math.round(data.current.temp)}°`;
      document.querySelector('[data-field="feels"]').textContent = `${Math.round(data.current.feels_like)}°`;
      document.querySelector('[data-field="desc"]').textContent = data.current.weather[0].description;
      document.querySelector('[data-field="humidity"]').textContent = `${data.current.humidity}%`;
      document.querySelector('[data-field="wind"]').textContent = `${data.current.wind_speed} ${units==='imperial'?'mph':'m/s'}`;

      // Update forecast (only 5 days)
      const days = document.querySelectorAll('#forecast-list li');
      for (let i=0; i<days.length; i++){
        const dayData = data.daily[i];
        const date = new Date(dayData.dt*1000);
        days[i].querySelector('[data-day]').textContent = date.toLocaleDateString(undefined, { weekday:'short' });
        days[i].querySelector('[data-high]').textContent = `${Math.round(dayData.temp.max)}°`;
        days[i].querySelector('[data-low]').textContent = `${Math.round(dayData.temp.min)}°`;
        days[i].querySelector('[data-desc]').textContent = dayData.weather[0].description;
      }

      status.textContent = 'Weather updated.';
    } catch (err) {
      console.error(err);
      status.textContent = 'Error fetching weather. Try again.';
    }
  }

  // Geolocation button
  document.getElementById('geo-btn')?.addEventListener('click', () => {
    status.textContent = 'Getting your location…';
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation not supported.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const units = document.getElementById('units')?.value || 'metric';
        fetchWeather(latitude, longitude, units);
      },
      (err) => {
        status.textContent = 'Unable to get location.';
      }
    );
  });

  // Search form
  document.getElementById('location-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchVal = document.getElementById('search').value.trim();
    if (!searchVal) return;

    try {
      status.textContent = 'Searching…';
      // Use geocoding API to get lat/lon
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchVal)}&limit=1&appid=${API_KEY}`
      );
      if (!geoRes.ok) throw new Error('Failed to fetch location');
      const geoData = await geoRes.json();
      if (!geoData.length) throw new Error('Location not found');

      const { lat, lon } = geoData[0];
      const units = document.getElementById('units')?.value || 'metric';
      fetchWeather(lat, lon, units);
    } catch (err) {
      console.error(err);
      status.textContent = 'Error fetching location. Check spelling.';
    }
  });
});





