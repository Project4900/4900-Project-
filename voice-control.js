// =========================
// Home Page Voice + Button Navigation
// =========================
window.addEventListener('DOMContentLoaded', () => {
    const weatherBtn = document.getElementById('weather-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const exitBtn = document.getElementById('exit-btn');
    const startVoiceBtn = document.getElementById('start-voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const synth = window.speechSynthesis;
    let recognition;
    let voiceEnabled = false;

    // ----------------------------
    // Speak text
    // ----------------------------
    function speak(text) {
        if(!voiceEnabled) return;
        if (synth.speaking) synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        synth.speak(utter);
    }

    // ----------------------------
    // Greet user
    // ----------------------------
    function greetUser() {
        const greeting = `Welcome to WeatherEase!
Say 1 or one: Weather
Say 2 or two: Settings
Say 9 or nine: Exit`;
        speak(greeting);
        voiceStatus.textContent = "Awaiting voice command...";
    }

    // ----------------------------
    // Start voice recognition
    // ----------------------------
    function startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            voiceStatus.textContent = "Voice commands not supported in this browser.";
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.trim().toLowerCase();
            handleVoiceCommand(command);
        };

        recognition.onerror = (event) => {
            voiceStatus.textContent = `Error: ${event.error}`;
        };

        recognition.onend = () => {
            if (voiceEnabled) setTimeout(() => recognition.start(), 300);
        };
    }

    // ----------------------------
    // Handle voice commands
    // ----------------------------
    function handleVoiceCommand(cmd) {
        switch(cmd) {
            case '1': case 'one': case 'get weather': case 'weather':
                speak("Opening Weather page");
                window.location.href = "weather.html";
                break;
            case '2': case 'two': case 'settings':
                speak("Opening Settings page");
                window.location.href = "settings.html";
                break;
            case '9': case 'nine': case 'exit':
                speak("Exiting app");
                window.location.href = "exit.html";
                break;
            default:
                speak("Command not recognized, please try again.");
        }
    }

    // ----------------------------
    // Button click handlers
    // ----------------------------
    weatherBtn?.addEventListener('click', () => window.location.href = "weather.html");
    settingsBtn?.addEventListener('click', () => window.location.href = "settings.html");
    exitBtn?.addEventListener('click', () => window.location.href = "exit.html");

    startVoiceBtn?.addEventListener('click', () => {
        voiceEnabled = true;
        speak("Voice features enabled!");
        startVoiceRecognition();
        greetUser();
        startVoiceBtn.style.display = "none";
    });
});

