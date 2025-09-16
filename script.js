console.log("WeatherEase App loaded");

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

const apiKey = "2c1fb322de5c86e87d6eb7e265fe9f32";

document.addEventListener('DOMContentLoaded', () => {
  const darkModeCheckbox = document.getElementById('dark-mode');
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    if (darkModeCheckbox) darkModeCheckbox.checked = true;
  }
  darkModeCheckbox?.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkModeCheckbox.checked);
    localStorage.setItem('darkMode', darkModeCheckbox.checked);
  });

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

  // Fetch weather function
  async function fetchWeather(query) {
    try {
      status.textContent = "Fetching weather…";
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&appid=${apiKey}&units=imperial`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Location not found");
      const data = await res.json();

      // Current conditions (take first item)
      const current = data.list[0];
      document.querySelector('[data-field="place"]').textContent = `${data.city.name}, ${data.city.country}`;
      document.querySelector('[data-field="temp"]').textContent = `${Math.round(current.main.temp)}°F`;
      document.querySelector('[data-field="feels"]').textContent = `${Math.round(current.main.feels_like)}°F`;
      document.querySelector('[data-field="desc"]').textContent = current.weather[0].description;
      document.querySelector('[data-field="humidity"]').textContent = `${current.main.humidity}%`;
      document.querySelector('[data-field="wind"]').textContent = `${current.wind.speed} mph`;

      // 5-day forecast
      const days = document.querySelectorAll('#forecast-list li');
      for (let i = 0; i < days.length; i++) {
        const dayData = data.list[i*8]; // approx 24h intervals
        if (!dayData) continue;
        const date = new Date(dayData.dt_txt);
        days[i].querySelector('[data-day]').textContent = date.toLocaleDateString(undefined, { weekday: 'short' });
        days[i].querySelector('[data-high]').textContent = `${Math.round(dayData.main.temp_max)}°F`;
        days[i].querySelector('[data-low]').textContent = `${Math.round(dayData.main.temp_min)}°F`;
        days[i].querySelector('[data-desc]').textContent = dayData.weather[0].main;
      }

      status.textContent = "Weather updated.";
    } catch (err) {
      console.error(err);
      status.textContent = "Error fetching location. Check spelling.";
    }
  }

  // Search form
  document.getElementById('location-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchVal = document.getElementById('search').value.trim();
    if (searchVal) fetchWeather(searchVal);
  });

  // Geolocation button
  document.getElementById('geo-btn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation not supported by your browser.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      () => status.textContent = 'Unable to get location.'
    );
  });
});
