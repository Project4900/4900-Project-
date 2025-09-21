console.log("WeatherEase App loaded");

const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32";
const PRO_ENDPOINT = "https://pro.openweathermap.org/data/2.5";

document.addEventListener('DOMContentLoaded', () => {
  // Year (safe if element missing)
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Toggles (safe if elements missing)
  const darkModeCheckbox = document.getElementById('dark-mode');
  const big = document.getElementById('big-text');
  const contrast = document.getElementById('high-contrast');
  const voice = document.getElementById('voice');
  const voiceStatus = document.getElementById('voice-status');
  const status = document.getElementById('current-status');

  // Persisted dark mode
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    if (darkModeCheckbox) darkModeCheckbox.checked = true;
  }
  darkModeCheckbox?.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkModeCheckbox.checked);
    localStorage.setItem('darkMode', darkModeCheckbox.checked);
  });

  big?.addEventListener('change', () => {
    document.documentElement.style.fontSize = big.checked ? '18px' : '';
  });
  contrast?.addEventListener('change', () => {
    document.body.style.filter = contrast.checked ? 'contrast(1.2)' : '';
  });
  voice?.addEventListener('change', () => {
    const msg = voice.checked
      ? 'Voice commands enabled (placeholder).'
      : 'Voice commands disabled.';
    if (status) status.textContent = msg;
    if (voiceStatus) voiceStatus.textContent = msg;
  });

  // Units helper (no Units control in UI; locked to metric)
  function getUnits() {
    return 'metric'; // 'metric' | 'imperial' — we use metric only
  }

  // Write into <span data-field="...">
  function setField(field, value) {
    const el = document.querySelector(`[data-field="${field}"]`);
    if (el) el.textContent = value ?? '—';
  }

  // ----- Fetch + render weather (current + 5-day) -----
  async function fetchWeather(lat, lon, units = 'metric') {
    try {
      if (status) status.textContent = 'Fetching weather data…';

      // CURRENT
      const currentResp = await fetch(
        `${PRO_ENDPOINT}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      if (!currentResp.ok) throw new Error("Current weather request failed");
      const current = await currentResp.json();

      const unitSymbol = units === 'imperial' ? '°F' : '°C';
      const windUnit  = units === 'imperial' ? 'mph' : 'm/s';

      setField('place', `${current.name || ''}${current.sys?.country ? ', ' + current.sys.country : ''}`);
      setField('temp',  current?.main?.temp       !== undefined ? `${Math.round(current.main.temp)}${unitSymbol}` : '—');
      setField('feels', current?.main?.feels_like !== undefined ? `${Math.round(current.main.feels_like)}${unitSymbol}` : '—');
      setField('desc',  current?.weather?.[0]?.description ?? '—');
      setField('humidity', current?.main?.humidity !== undefined ? `${current.main.humidity}%` : '—');
      setField('wind', current?.wind?.speed !== undefined ? `${Math.round(current.wind.speed)} ${windUnit}` : '—');

      // FORECAST (3-hourly -> group into local days and compute highs/lows)
      const forecastResp = await fetch(
        `${PRO_ENDPOINT}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      if (!forecastResp.ok) throw new Error("Forecast request failed");
      const forecast = await forecastResp.json();

      renderForecast(forecast, units);

      if (status) status.textContent = 'Weather updated successfully.';
    } catch (err) {
      console.error(err);
      if (status) status.textContent = 'Error fetching location. Check spelling or try again.';
      setField('place','—'); setField('temp','—'); setField('feels','—');
      setField('desc','—');  setField('humidity','—'); setField('wind','—');
      document.querySelectorAll('#forecast-list li').forEach(li => {
        li.querySelector('[data-day]').textContent  = '—';
        li.querySelector('[data-high]').textContent = '—';
        li.querySelector('[data-low]').textContent  = '—';
        li.querySelector('[data-desc]').textContent = '—';
      });
    }
  }

  // Render 5-day forecast with correct local-day highs/lows
  function renderForecast(forecast, units = 'metric') {
    if (!forecast?.list?.length) return;

    const tzOffsetSec = forecast?.city?.timezone ?? 0; // seconds offset from UTC
    const byDay = new Map();

    for (const item of forecast.list) {
      const localMs = (item.dt + tzOffsetSec) * 1000;
      const d = new Date(localMs);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;

      const entry = byDay.get(key) ?? { mins: [], maxs: [], samples: [] };
      if (Number.isFinite(item.main?.temp_min)) entry.mins.push(item.main.temp_min);
      if (Number.isFinite(item.main?.temp_max)) entry.maxs.push(item.main.temp_max);
      entry.samples.push({ hour: d.getUTCHours(), desc: item.weather?.[0]?.description ?? '' });
      byDay.set(key, entry);
    }

    const dayKeys = Array.from(byDay.keys()).sort().slice(0, 5);
    const liNodes = document.querySelectorAll('#forecast-list li');
    const unitSymbol = units === 'imperial' ? '°F' : '°C';

    dayKeys.forEach((key, i) => {
      if (!liNodes[i]) return;
      const { mins, maxs, samples } = byDay.get(key);

      // Representative description (closest to local noon)
      let repDesc = '—';
      if (samples.length) {
        let best = samples[0], bestDelta = Math.abs(samples[0].hour - 12);
        for (const s of samples) {
          const d = Math.abs(s.hour - 12);
          if (d < bestDelta) { best = s; bestDelta = d; }
        }
        repDesc = best.desc || '—';
      }

      // Day name from key
      const [y, m, dd] = key.split('-').map(Number);
      const dayName = new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString(undefined, { weekday: 'short' });

      const highs = maxs.filter(Number.isFinite);
      const lows  = mins.filter(Number.isFinite);
      const hi = highs.length ? Math.round(Math.max(...highs)) : null;
      const lo = lows.length  ? Math.round(Math.min(...lows))  : null;

      liNodes[i].querySelector('[data-day]').textContent  = dayName;
      liNodes[i].querySelector('[data-high]').textContent = hi !== null ? `${hi}${unitSymbol}` : '—';
      liNodes[i].querySelector('[data-low]').textContent  = lo !== null ? `${lo}${unitSymbol}` : '—';
      liNodes[i].querySelector('[data-desc]').textContent = repDesc;
    });
  }

  // ----- Geolocation button -----
  document.getElementById('geo-btn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (status) status.textContent = 'Geolocation not supported by your browser.';
      return;
    }
    if (status) status.textContent = 'Getting your location…';
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, getUnits()),
      () => { if (status) status.textContent = 'Unable to get location.'; },
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
    );
  });

  // ----- Search form -----
  document.getElementById('location-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const searchVal = document.getElementById('search')?.value?.trim();
    if (!searchVal) return;

    try {
      if (status) status.textContent = 'Geocoding location…';
      const geoResp = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchVal)}&limit=1&appid=${API_KEY}`
      );
      if (!geoResp.ok) throw new Error('Geocoding failed');
      const geoData = await geoResp.json();
      if (!geoData[0]) throw new Error('Location not found');

      const { lat, lon } = geoData[0];
      fetchWeather(lat, lon, getUnits());
    } catch (err) {
      console.error(err);
      if (status) status.textContent = 'Error fetching location. Check spelling.';
    }
  });

  // ----- Get Temp button (typed location if present, else geolocation) -----
  document.getElementById('get-temp-btn')?.addEventListener('click', async () => {
    const q = document.getElementById('search')?.value?.trim();
    const units = getUnits(); // 'metric'
    try {
      if (q) {
        if (status) status.textContent = 'Getting temperature for that location…';
        const geoResp = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${API_KEY}`
        );
        if (!geoResp.ok) throw new Error('Geocoding failed');
        const [first] = await geoResp.json();
        if (!first) throw new Error('Location not found');
        await fetchWeather(first.lat, first.lon, units);
        if (status) status.textContent = 'Done.';
      } else {
        if (!navigator.geolocation) { if (status) status.textContent = 'Geolocation not supported.'; return; }
        if (status) status.textContent = 'Getting your location…';
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            await fetchWeather(coords.latitude, coords.longitude, units);
            if (status) status.textContent = 'Done.';
          },
          () => { if (status) status.textContent = 'Unable to get location.'; },
          { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
        );
      }
    } catch (e) {
      console.error(e);
      if (status) status.textContent = 'Could not get temperature. Try again.';
    }
  });
});
