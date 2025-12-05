// =========================
// Home Page Voice + Button Navigation (Always-visible, sequential speech)
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
    // Get user voice settings
    // ----------------------------
    function getUserVoiceSettings() {
        const name = localStorage.getItem('voiceName');
        const rate = parseFloat(localStorage.getItem('speechRate') || 1);
        const pitch = parseFloat(localStorage.getItem('speechPitch') || 1);
        const voices = synth.getVoices();
        const voice = voices.find(v => v.name === name) || voices[0];
        return { voice, rate, pitch };
    }

    // ----------------------------
    // Speak text
    // ----------------------------
    function speak(text, cancelBefore = true) {
        if (!voiceEnabled) return;
        if (cancelBefore && synth.speaking) synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const { voice, rate, pitch } = getUserVoiceSettings();
        utter.voice = voice;
        utter.rate = rate;
        utter.pitch = pitch;
        synth.speak(utter);
    }

    // ----------------------------
    // Speak multiple lines sequentially
    // ----------------------------
    function speakSequence(lines) {
        if (!voiceEnabled) return;
        let index = 0;

        function speakNext() {
            if (index >= lines.length) return;
            const utter = new SpeechSynthesisUtterance(lines[index]);
            const { voice, rate, pitch } = getUserVoiceSettings();
            utter.voice = voice;
            utter.rate = rate;
            utter.pitch = pitch;
            utter.onend = () => {
                index++;
                speakNext();
            };
            synth.speak(utter);
        }

        speakNext();
    }

    // ----------------------------
    // Greet user
    // ----------------------------
    function greetUser() {
        const lines = [
            "Welcome to WeatherEase!",
            "You can choose from the following options.",
            "Option 1: Weather.",
            "Option 2: Settings.",
            "Option 9: Exit."
        ];
        speakSequence(lines);
        if (voiceStatus) voiceStatus.textContent = "Awaiting voice command...";
    }

    // ----------------------------
    // Start voice recognition
    // ----------------------------
    function startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            if (voiceStatus) voiceStatus.textContent = "Voice commands not supported in this browser.";
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;
        recognition.start();

        recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            handleVoiceCommand(command);
        };

        recognition.onerror = (event) => {
            if (voiceStatus) voiceStatus.textContent = `Error: ${event.error}`;
        };

        recognition.onend = () => {
            if (voiceEnabled) setTimeout(() => recognition.start(), 300);
        };
    }

    // ----------------------------
    // Handle voice commands
    // ----------------------------
    function handleVoiceCommand(cmd) {
        switch (cmd) {
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
    if (weatherBtn) weatherBtn.addEventListener('click', () => window.location.href = "weather.html");
    if (settingsBtn) settingsBtn.addEventListener('click', () => window.location.href = "settings.html");
    if (exitBtn) exitBtn.addEventListener('click', () => window.location.href = "exit.html");

    if (startVoiceBtn) startVoiceBtn.addEventListener('click', () => {
        if (!voiceEnabled) {
            voiceEnabled = true;
            localStorage.setItem('voiceEnabled', true);
            speak("Voice features enabled!");
            startVoiceRecognition();
            greetUser();
        } else {
            speak("Voice commands already enabled.");
        }
    });

    // ----------------------------
    // Auto-start if voice enabled
    // ----------------------------
    if (localStorage.getItem('voiceEnabled') === 'true') {
        voiceEnabled = true;
        if (voiceStatus) voiceStatus.textContent = "Voice features enabled. Click 'Start Voice' to speak.";
        greetUser(); // optional
    // DO NOT call startVoiceRecognition() automatically
    }
});


