// =========================
// WeatherEase Voice Control
// =========================

console.log("Voice Control loaded");

// ----------------------------
// DOM Elements
// ----------------------------
const enableVoiceBtn = document.getElementById('enable-voice-btn');
const currentStatus = document.getElementById('current-status');
let recognition;
let voiceEnabled = false;

// ----------------------------
// Speech helper
// ----------------------------
function speak(text) {
  if (!voiceEnabled) return;
  if (!window.speechSynthesis) return;

  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  window.speechSynthesis.speak(utter);
}

// ----------------------------
// Greet user when voice enabled
// ----------------------------
function greetUser() {
  const greeting = `Voice commands enabled! You can ask for:
1: Current temperature
2: Feels like
3: Weather condition
4: 5-day forecast
5: Return home`;
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
  recognition.continuous = true;

  recognition.onresult = event => {
    const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    handleCommand(command);
  };

  recognition.onerror = event => {
    console.error('Voice recognition error:', event.error);
    if (currentStatus) currentStatus.textContent = `Voice error: ${event.error}`;
  };

  recognition.onend = () => {
    if (voiceEnabled) recognition.start(); // auto-restart
  };

  recognition.start();
}

// ----------------------------
// Handle voice commands
// ----------------------------
function handleCommand(cmd) {
  if (!window.weatherDataReady) {
    speak("Weather data is not ready yet.");
    return;
  }

  switch(cmd) {
    case '1':
    case 'one':
    case 'temperature':
    case 'current temperature':
      speakField('temp');
      break;
    case '2':
    case 'two':
    case 'feels like':
      speakField('feels');
      break;
    case '3':
    case 'three':
    case 'condition':
    case 'weather':
      speakField('desc');
      break;
    case '4':
    case 'four':
    case 'forecast':
    case 'five day forecast':
      speakForecast();
      break;
    case '5':
    case 'five':
    case 'home':
    case 'return home':
      speak("Returning home");
      document.getElementById('home-btn')?.click();
      break;
    default:
      speak("Command not recognized. Please try again.");
      break;
  }
}

// ----------------------------
// Speak a specific weather field
// ----------------------------
function speakField(field) {
  const el = document.querySelector(`[data-field="${field}"]`);
  if (el && el.textContent && el.textContent !== '—') {
    speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  } else {
    speak(`${field.replace('-', ' ')} is not available`);
  }
}

// ----------------------------
// Speak 5-day forecast
// ----------------------------
function speakForecast() {
  const forecastItems = document.querySelectorAll('#forecast-list li');
  if (!forecastItems.length) {
    speak("No forecast data available.");
    return;
  }

  let text = "5-day forecast: ";
  forecastItems.forEach(li => {
    const day = li.querySelector('[data-day]')?.textContent || '—';
    const high = li.querySelector('[data-high]')?.textContent || '—';
    const low = li.querySelector('[data-low]')?.textContent || '—';
    const desc = li.querySelector('[data-desc]')?.textContent || '—';
    text += `${day}: ${desc}, high ${high}, low ${low}. `;
  });

  speak(text);
}

// ----------------------------
// Enable Voice button click
// ----------------------------
enableVoiceBtn?.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;

  if (voiceEnabled) {
    greetUser();
    startRecognition();
    enableVoiceBtn.textContent = "Disable Voice";
  } else {
    recognition?.stop();
    if (currentStatus) currentStatus.textContent = "Voice commands disabled.";
    enableVoiceBtn.textContent = "Enable Voice";
  }
});

