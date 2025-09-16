const API_KEY = '2c1fb322de5c86e87d6eb7e265fe9f32';

document.addEventListener('DOMContentLoaded', () => {
  const status = document.getElementById('current-status');

  async function fetchWeather(city) {
    try {
      status.textContent = 'Fetching weather…';
      // Current weather
      const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`);
      if (!currentRes.ok) throw new Error('Failed to fetch current weather.');
      const currentData = await currentRes.json();
      document.querySelector('[data-field="place"]').textContent = `${currentData.name}, ${currentData.sys.country}`;
      document.querySelector('[data-field="temp"]').textContent = `${Math.round(currentData.main.temp)}°F`;
      document.querySelector('[data-field="feels"]').textContent = `${Math.round(currentData.main.feels_like)}°F`;
      document.querySelector('[data-field="desc"]').textContent = currentData.weather[0].description;
      document.querySelector('[data-field="humidity"]').textContent = `${currentData.main.humidity}%`;
      document.querySelector('[data-field="wind"]').textContent = `${Math.round(currentData.wind.speed)} mph`;

      // 5-day forecast (3-hour intervals)
      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${API_KEY}`);
      if (!forecastRes.ok) throw new Error('Failed to fetch forecast.');
      const forecastData = await forecastRes.json();

      // Calculate daily highs/lows
      const forecastList = document.querySelectorAll('#forecast-list li');
      const days = {};
      forecastData.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (!days[day]) days[day] = { high: -Infinity, low: Infinity, desc: [] };
        days[day].high = Math.max(days[day].high, item.main.temp_max);
        days[day].low = Math.min(days[day].low, item.main.temp_min);
        days[day].desc.push(item.weather[0].main);
      });

      // Fill first 5 days
      const dayKeys = Object.keys(days).slice(0, 5);
      forecastList.forEach((li, i) => {
        const day = days[dayKeys[i]];
        li.querySelector('[data-day]').textContent = dayKeys[i];
        li.querySelector('[data-high]').textContent = `${Math.round(day.high)}°F`;
        li.querySelector('[data-low]').textContent = `${Math.round(day.low)}°F`;
        // Most frequent weather description
        const freqDesc = day.desc.sort((a,b) =>
          day.desc.filter(v=>v===a).length - day.desc.filter(v=>v===b).length
        ).pop();
        li.querySelector('[data-desc]').textContent = freqDesc;
      });

      status.textContent = 'Weather loaded successfully!';
    } catch (err) {
      console.error(err);
      status.textContent = 'Error fetching weather. Please try again.';
    }
  }

  // Search form
  document.getElementById('location-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = document.getElementById('search').value.trim();
    if (city) fetchWeather(city);
  });
});


