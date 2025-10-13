// =========================
// Voice Control for Weather Page
// =========================

// DOM elements
const voiceCheckbox = document.getElementById('voice');
const currentStatus = document.getElementById('current-status');
const currentCard = document.getElementById('current-card');
const forecastList = document.getElementById('forecast-list');
const homeBtn = document.getElementById('home-btn');
const getTempBtn = document.getElementById('get-temp-btn');
const geoBtn = document.getElementById('geo-btn');

const synth = window.speechSynthesis;
let recognition;
let voiceEnabled = false;
let weatherDataReady = false;  // Set true after weather fetch

// ----------------------------
// Speak text
// ----------------------------
function speak(text) {
  if (!voiceEnabled) return;
  if (synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Greet user
// ----------------------------
function greetUser() {
  const greeting = `Welcome to WeatherEase Weather page!
Say:
1: Current temperature
2: Feels like
3: Condition
4: Humidity
5: Wind
6: 5-day forecast
7: Return home`;
  speak(greeting);
  if (currentStatus) currentStatus.textContent = "Voice commands active. Awaiting your instruction...";
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    speak("Voice commands not supported in this browser.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = event => {
    const command = event.results[0][0].transcript.trim().toLowerCase();
    handleCommand(command);
  };

  recognition.onerror = event => {
    console.error(event.error);
    if (currentStatus) currentStatus.textContent = `Voice error: ${event.error}`;
  };

  recognition.onend = () => {
    if (voiceEnabled) recognition.start();
  };
}

// ----------------------------
// Handle commands
// ----------------------------
function handleCommand(cmd) {
  if (!weatherDataReady) { speak("Weather data is not ready yet."); return; }

  switch(cmd) {
    case '1':
    case 'one':
    case 'temperature':
    case 'current temperature': speakCurrent('temp'); break;
    case '2':
    case 'two':
    case 'feels like': speakCurrent('feels'); break;
    case '3':
    case 'three':
    case 'condition': speakCurrent('desc'); break;
    case '4':
    case 'four':
    case 'humidity': speakCurrent('humidity'); break;
    case '5':
    case 'five':
    case 'wind': speakCurrent('wind'); break;
    case '6':
    case 'six':
    case 'forecast':
    case 'five day forecast': speakForecast(); break;
    case '7':
    case 'seven':
    case 'home':
    case 'return home': speak("Returning home"); homeBtn?.click(); break;
    default: speak("Command not recognized. Please try again."); break;
  }
}

// ----------------------------
// Speak current weather field
// ----------------------------
function speakCurrent(field) {
  const el = document.querySelector(`[data-field="${field}"]`);
  if (el && el.textContent && el.textContent !== '—') speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  else speak(`${field.replace('-', ' ')} is not available`);
}

// ----------------------------
// Speak 5-day forecast
// ----------------------------
function speakForecast() {
  const days = [...forecastList.querySelectorAll('li')];
  if (!days.length) { speak("No forecast data."); return; }

  let text = "5-day forecast: ";
  days.forEach(li => {
    const day = li.querySelector('[data-day]')?.textContent || '—';
    const high = li.querySelector('[data-high]')?.textContent || '—';
    const low = li.querySelector('[data-low]')?.textContent || '—';
    const desc = li.querySelector('[data-desc]')?.textContent || '—';
    text += `${day}: ${desc}, high ${high}, low ${low}. `;
  });
  speak(text);
}

// ----------------------------
// Enable voice recognition
// ----------------------------
voiceCheckbox?.addEventListener('change', () => {
  if (voiceCheckbox.checked) {
    voiceEnabled = true;
    greetUser();
    startRecognition();
  } else {
    voiceEnabled = false;
    recognition?.stop();
    if (currentStatus) currentStatus.textContent = "Voice commands disabled.";
  }
});

// ----------------------------
// Speak weather immediately after fetching
// ----------------------------
function speakWeatherImmediately() {
  if (!weatherDataReady) return;
  speakCurrent('temp');
  speakCurrent('feels');
  speakCurrent('desc');
  speakCurrent('humidity');
  speakCurrent('wind');
}

// ----------------------------
// Hook Get Temp button
// ----------------------------
getTempBtn?.addEventListener('click', () => {
  // Assuming you already fetch the weather when clicked
  setTimeout(() => speakWeatherImmediately(), 500); // delay to ensure data is ready
});

// ----------------------------
// Hook Use My Location button
// ----------------------------
geoBtn?.addEventListener('click', () => {
  // Geolocation fetch happens elsewhere; just read weather after a short delay
  setTimeout(() => speakWeatherImmediately(), 2000); // adjust delay based on fetch time
});

