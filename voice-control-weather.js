// =========================
// WeatherEase Voice Control 
// =========================

console.log("Voice Control loaded");

// ----------------------------
// DOM Elements
// ----------------------------
const enableVoiceBtn = document.getElementById('enable-voice-btn');
const currentStatus = document.getElementById('current-status');

// ----------------------------
// Voice recognition variables
// ----------------------------
let recognition;
let voiceEnabled = localStorage.getItem('voiceEnabled') === 'true';

// ----------------------------
// Get user voice settings from Settings page
// ----------------------------
function getUserVoiceSettings() {
    const synth = window.speechSynthesis;
    const name = localStorage.getItem('voiceName');
    const rate = parseFloat(localStorage.getItem('speechRate')) || 1;
    const pitch = parseFloat(localStorage.getItem('speechPitch')) || 1;
    const voice = synth.getVoices().find(v => v.name === name) || synth.getVoices()[0];
    return { voice, rate, pitch };
}

// ----------------------------
// Speak helper
// ----------------------------
function speak(text) {
    if (!voiceEnabled) return;
    if (!window.speechSynthesis) return;

    const { voice, rate, pitch } = getUserVoiceSettings();

    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.voice = voice;
    utter.rate = rate;
    utter.pitch = pitch;
    window.speechSynthesis.speak(utter);
}

// ----------------------------
// Greet user
// ----------------------------
function greetUser() {
    if (!voiceEnabled) return;
    const greeting = `Voice commands enabled! 
Option 1: Temperature.
Option 2: Feels like.
Option 3: Weather condition.
Option 4: 5-day forecast.
Option 5: Humidity.
Option 6: Wind.
Option 7: Return home.`;
    speak(greeting);
    if (currentStatus) currentStatus.textContent = "Voice commands active. Awaiting your instruction...";
}

// ----------------------------
// Start recognition
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
        if (voiceEnabled) recognition.start();
    };

    recognition.start();
}

// ----------------------------
// Handle voice commands
// ----------------------------
function handleCommand(cmd) {
    if (!window.weatherDataReady) {
        speak("Weather data is not ready yet. Showing cached data if available.");
    }

    switch(cmd) {
        case '1': case 'one': case 'temperature': case 'current temperature':
            speakField('temperature');
            break;
        case '2': case 'two': case 'feels like':
            speakField('feels like');
            break;
        case '3': case 'three': case 'condition': case 'weather':
            speakField('current condition');
            break;
        case '4': case 'four': case 'humidity': 
            speakField('humidity');
            break;
        case '5': case 'five': case 'wind':
            speakField('wind');
            break;
        case '6': case 'six': case 'forecast': case 'five day forecast':
            speakForecast();
            break;
        case '7': case 'seven': case 'home': case 'return home':
            speak("Returning home");
            window.location.href = "index.html";
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
// Enable Voice button
// ----------------------------
enableVoiceBtn?.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    localStorage.setItem('voiceEnabled', voiceEnabled);

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

// ----------------------------
// Auto-start if voice enabled
// ----------------------------
if (voiceEnabled) {
    greetUser();
    startRecognition();
}

