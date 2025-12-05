console.log("WeatherEase App loaded");

const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32";
const PRO_ENDPOINT = "https://pro.openweathermap.org/data/2.5";

// Make weatherDataReady global so voice script can see it
window.weatherDataReady = false;

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------
    // Basic DOM references
    // ----------------------------
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const darkModeCheckbox = document.getElementById('dark-mode');
    const big = document.getElementById('big-text');
    const contrast = document.getElementById('high-contrast');
    const status = document.getElementById('current-status');
    const unitsSelect = document.getElementById('units-select'); // units dropdown

    // ----------------------------
    // Persist dark mode
    // ----------------------------
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        if (darkModeCheckbox) darkModeCheckbox.checked = true;
    }
    darkModeCheckbox?.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkModeCheckbox.checked);
        localStorage.setItem('darkMode', darkModeCheckbox.checked);
    });

    // ----------------------------
    // Big text toggle
    // ----------------------------
    big?.addEventListener('change', () => {
        document.documentElement.style.fontSize = big.checked ? '18px' : '';
    });

    // ----------------------------
    // High contrast toggle
    // ----------------------------
    contrast?.addEventListener('change', () => {
        document.body.style.filter = contrast.checked ? 'contrast(1.2)' : '';
    });

    // ----------------------------
    // Units helper (uses localStorage)
    // ----------------------------
    function getUnits() {
        return localStorage.getItem('units') || 'metric';
    }

    if (unitsSelect) {
        unitsSelect.value = getUnits();
        unitsSelect.addEventListener('change', () => {
            localStorage.setItem('units', unitsSelect.value);
            if (status) status.textContent = `Units set to ${unitsSelect.value}`;
        });
    }

    // ----------------------------
    // Helper to update DOM fields
    // ----------------------------
    function setField(field, value) {
        const el = document.querySelector(`[data-field="${field}"]`);
        if (el) el.textContent = value ?? '—';
    }

    // ----------------------------
    // Emoji helper
    // ----------------------------
    function getConditionEmoji(desc) {
        if (!desc) return '';
        desc = desc.toLowerCase();
        if (desc.includes('cloud')) return '☁️';
        if (desc.includes('rain')) return '🌧️';
        if (desc.includes('snow')) return '❄️';
        if (desc.includes('sun') || desc.includes('clear')) return '☀️';
        if (desc.includes('mist') || desc.includes('fog') || desc.includes('haze')) return '🌫️';
        return '❓';
    }

    // ----------------------------
    // Fetch current weather + 5-day forecast
    // ----------------------------
    async function fetchWeather(lat, lon, units = getUnits()) {
        try {
            window.weatherDataReady = false;
            if (status) status.textContent = 'Fetching weather data…';

            const currentUrl = `${PRO_ENDPOINT}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
            const forecastUrl = `${PRO_ENDPOINT}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

            let current, forecast;

            // Try fetching current weather
            try {
                const currentResp = await fetch(currentUrl);
                if (!currentResp.ok) throw new Error("Current weather request failed");
                current = await currentResp.json();
                localStorage.setItem('lastWeatherCurrent', JSON.stringify(current));
            } catch {
                const cached = localStorage.getItem('lastWeatherCurrent');
                if (cached) current = JSON.parse(cached);
                else throw new Error("No cached weather data available");
            }

            // Try fetching forecast
            try {
                const forecastResp = await fetch(forecastUrl);
                if (!forecastResp.ok) throw new Error("Forecast request failed");
                forecast = await forecastResp.json();
                localStorage.setItem('lastWeatherForecast', JSON.stringify(forecast));
            } catch {
                const cached = localStorage.getItem('lastWeatherForecast');
                if (cached) forecast = JSON.parse(cached);
                else throw new Error("No cached forecast data available");
            }

            const unitSymbol = units === 'imperial' ? '°F' : '°C';
            const windUnit = units === 'imperial' ? 'mph' : 'm/s';

            // Update DOM with current weather
            setField('place', `${current.name || ''}${current.sys?.country ? ', ' + current.sys.country : ''}`);
            setField('temperature', current?.main?.temp !== undefined ? `${Math.round(current.main.temp)}${unitSymbol}` : '—');
            setField('feels like', current?.main?.feels_like !== undefined ? `${Math.round(current.main.feels_like)}${unitSymbol}` : '—');
            setField('current condition', current?.weather?.[0]?.description ?? '—');
            setField('humidity', current?.main?.humidity !== undefined ? `${current.main.humidity}%` : '—');
            setField('wind', current?.wind?.speed !== undefined ? `${Math.round(current.wind.speed)} ${windUnit}` : '—');

            // Update condition emoji
            const emojiEl = document.getElementById('condition-emoji');
            if (emojiEl) {
                emojiEl.textContent = getConditionEmoji(current?.weather?.[0]?.description);
            }

            // Update forecast
            renderForecast(forecast, units);

            if (status) status.textContent = 'Weather updated successfully.';
            window.weatherDataReady = true;

        } catch (err) {
            console.error(err);
            window.weatherDataReady = false;
            if (status) status.textContent = 'Unable to fetch weather. Showing cached data if available.';
        }
    }

    // ----------------------------
    // Render 5-day forecast
    // ----------------------------
    function renderForecast(forecast, units = getUnits()) {
        if (!forecast?.list?.length) return;

        const tzOffsetSec = forecast?.city?.timezone ?? 0;
        const byDay = new Map();

        for (const item of forecast.list) {
            const localMs = (item.dt + tzOffsetSec) * 1000;
            const d = new Date(localMs);

            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const entry = byDay.get(key) ?? { mins: [], maxs: [], samples: [] };
            if (Number.isFinite(item.main?.temp_min)) entry.mins.push(item.main.temp_min);
            if (Number.isFinite(item.main?.temp_max)) entry.maxs.push(item.main.temp_max);
            entry.samples.push({ hour: d.getHours(), desc: item.weather?.[0]?.description ?? '' });
            byDay.set(key, entry);
        }

        const dayKeys = Array.from(byDay.keys()).sort().slice(0, 5);
        const liNodes = document.querySelectorAll('#forecast-list li');
        const unitSymbol = units === 'imperial' ? '°F' : '°C';

        dayKeys.forEach((key, i) => {
            if (!liNodes[i]) return;
            const { mins, maxs, samples } = byDay.get(key);

            let repDesc = '—';
            if (samples.length) {
                let best = samples[0], bestDelta = Math.abs(samples[0].hour - 12);
                for (const s of samples) {
                    const delta = Math.abs(s.hour - 12);
                    if (delta < bestDelta) { best = s; bestDelta = delta; }
                }
                repDesc = best.desc || '—';
            }

            const [y, m, dd] = key.split('-').map(Number);
            const dayName = new Date(y, m - 1, dd).toLocaleDateString(undefined, { weekday: 'long' });

            liNodes[i].querySelector('[data-day]').textContent = dayName;
            liNodes[i].querySelector('[data-high]').textContent = maxs.length ? `${Math.round(Math.max(...maxs))}${unitSymbol}` : '—';
            liNodes[i].querySelector('[data-low]').textContent = mins.length ? `${Math.round(Math.min(...mins))}${unitSymbol}` : '—';
            liNodes[i].querySelector('[data-desc]').textContent = repDesc;
        });
    }

    // ----------------------------
    // Geolocation button
    // ----------------------------
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

    // ----------------------------
    // Search form submit
    // ----------------------------
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

// ----------------------------
// 🌤️ Simple Weather Chatbot
// ----------------------------
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');

if (chatForm && chatInput && chatLog) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim().toLowerCase();
        if (!message) return;

        addChatMessage('user', chatInput.value);
        chatInput.value = '';

        const reply = getWeatherReply(message);
        addChatMessage('bot', reply);
    });
}

// ----------------------------
// Display messages in chat
// ----------------------------
function addChatMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${role}`;
    msg.textContent = text;
    msg.style.margin = '.3rem 0';
    msg.style.padding = '.4rem .6rem';
    msg.style.borderRadius = '6px';
    msg.style.alignSelf = role === 'user' ? 'flex-end' : 'flex-start';
    msg.style.background = role === 'user' ? '#e1f5fe' : '#f1f1f1';
    chatLog.appendChild(msg);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// ----------------------------
// Weather response logic
// ----------------------------
function getWeatherReply(message) {
    const temp = document.querySelector('[data-field="temperature"]')?.textContent || 'unknown';
    const feels = document.querySelector('[data-field="feels like"]')?.textContent || 'unknown';
    const condition = document.querySelector('[data-field="current condition"]')?.textContent || 'unknown';
    const humidity = document.querySelector('[data-field="humidity"]')?.textContent || 'unknown';
    const wind = document.querySelector('[data-field="wind"]')?.textContent || 'unknown';
    const place = document.querySelector('[data-field="place"]')?.textContent || 'your current location';

    // Specific fields
    if (message.includes('temperature')) return `The current temperature is ${temp}.`;
    if (message.includes('feels like')) return `The weather in ${place} feels like ${feels}.`;
    if (message.includes('condition') || message.includes('weather condition')) return `Current weather is ${condition}.`;
    if (message.includes('humidity')) return `Humidity in ${place} is ${humidity}.`;
    if (message.includes('wind')) return `The wind speed is ${wind}.`;
    if (message.includes('current weather') || message.includes('weather')) {
        return `Right now in ${place}, it's ${condition} with a temperature of ${temp} (feels like ${feels}). Humidity is ${humidity}, and wind speed is ${wind}.`;
    }

    // Default fallback
    return "I can answer questions about the current weather in your set location only. Try asking about temperature, feels like, condition, humidity, or wind.";
}


    // ----------------------------
// Text-to-Speech helper (respects stored voice settings)
// ----------------------------
function speakMessage(message) {
    if (!window.speechSynthesis || !localStorage.getItem('voiceEnabled') || localStorage.getItem('voiceEnabled') !== 'true') return;

    const utter = new SpeechSynthesisUtterance(message);
    const voiceName = localStorage.getItem('voiceName');
    if (voiceName) {
        const selectedVoice = speechSynthesis.getVoices().find(v => v.name === voiceName);
        if (selectedVoice) utter.voice = selectedVoice;
    }
    utter.rate = parseFloat(localStorage.getItem('speechRate')) || 1;
    utter.pitch = parseFloat(localStorage.getItem('speechPitch')) || 1;
    speechSynthesis.speak(utter);
}

// ----------------------------
// Replace offline/online alerts with TTS + visual
// ----------------------------
window.addEventListener('offline', () => {
    const alertEl = document.getElementById('current-status') || document.getElementById('voice-status');
    if (alertEl) alertEl.textContent = '⚠️ You are offline — showing cached data.';
    speakMessage('You are offline — showing cached data.');
});

window.addEventListener('online', () => {
    const alertEl = document.getElementById('current-status') || document.getElementById('voice-status');
    if (alertEl) alertEl.textContent = '✅ Back online.';
    speakMessage('You are back online.');
});

// ----------------------------
// Make sliders accessible for ARIA
// ----------------------------
const speechRate = document.getElementById('voice-rate');
const speechPitch = document.getElementById('voice-pitch');
const rateDisplay = document.getElementById('rate-display');
const pitchDisplay = document.getElementById('pitch-display');

if (speechRate) {
    speechRate.setAttribute('role', 'slider');
    speechRate.setAttribute('aria-valuemin', speechRate.min);
    speechRate.setAttribute('aria-valuemax', speechRate.max);
    speechRate.setAttribute('aria-valuenow', speechRate.value);
    speechRate.addEventListener('input', () => {
        rateDisplay.textContent = speechRate.value;
        speechRate.setAttribute('aria-valuenow', speechRate.value);
    });
}

if (speechPitch) {
    speechPitch.setAttribute('role', 'slider');
    speechPitch.setAttribute('aria-valuemin', speechPitch.min);
    speechPitch.setAttribute('aria-valuemax', speechPitch.max);
    speechPitch.setAttribute('aria-valuenow', speechPitch.value);
    speechPitch.addEventListener('input', () => {
        pitchDisplay.textContent = speechPitch.value;
        speechPitch.setAttribute('aria-valuenow', speechPitch.value);
    });
}


}); // END of DOMContentLoaded

// ----------------------------
// Service Worker
// ----------------------------
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('SW registration failed:', err));
}

// ----------------------------
// Offline/online alerts (visual + voice)
// ----------------------------
window.addEventListener('offline', () => {
    const alertEl = document.getElementById('current-status') || document.getElementById('voice-status');
    if (alertEl) alertEl.textContent = '⚠️ You are offline. Showing cached data.';
    if (window.speechSynthesis) {
        const speech = new SpeechSynthesisUtterance('You are offline. Showing cached data.');
        window.speechSynthesis.speak(speech);
    }
});

window.addEventListener('online', () => {
    const alertEl = document.getElementById('current-status') || document.getElementById('voice-status');
    if (alertEl) alertEl.textContent = '✅ Back online.';
    if (window.speechSynthesis) {
        const speech = new SpeechSynthesisUtterance('You are back online.');
        window.speechSynthesis.speak(speech);
    }
});

// ----------------------------
// Online/offline status indicator in header (text + dot)
// ----------------------------
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (!header) return;

    // Create container for status
    const statusContainer = document.createElement('div');
    statusContainer.id = 'online-status';
    statusContainer.style.display = 'flex';
    statusContainer.style.alignItems = 'center';
    statusContainer.style.position = 'absolute';
    statusContainer.style.top = '0.75rem';
    statusContainer.style.right = '1.5rem';
    statusContainer.style.fontSize = '0.9rem';
    statusContainer.style.fontWeight = '600';
    statusContainer.style.color = '#fff';
    header.appendChild(statusContainer);

    // Create colored dot
    const statusDot = document.createElement('span');
    statusDot.style.display = 'inline-block';
    statusDot.style.width = '12px';
    statusDot.style.height = '12px';
    statusDot.style.borderRadius = '50%';
    statusDot.style.marginRight = '0.5rem';
    statusContainer.appendChild(statusDot);

    // Create text node
    const statusText = document.createElement('span');
    statusContainer.appendChild(statusText);

    // Update function
    function updateStatus() {
        if (navigator.onLine) {
            statusDot.style.backgroundColor = '#4caf50'; // green
            statusText.textContent = 'Online';
        } else {
            statusDot.style.backgroundColor = '#ff5555'; // red
            statusText.textContent = 'You’re offline — showing saved data';
        }
    }

    updateStatus(); // initialize
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
});
