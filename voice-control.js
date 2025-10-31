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
        utter.rate = 0.85; // slower, natural
        synth.speak(utter);
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

        lines.forEach(line => {
            const utter = new SpeechSynthesisUtterance(line);
            utter.rate = 0.85;
            synth.speak(utter);
        });

        if (voiceStatus) voiceStatus.textContent = "Awaiting voice command...";
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
        recognition.continuous = true;

        recognition.start();

        recognition.onresult = (event) => {
            const command = event.results[event.results.length-1][0].transcript.trim().toLowerCase();
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
                setTimeout(() => window.location.href = "weather.html", 500);
                break;
            case '2': case 'two': case 'settings':
                speak("Opening Settings page");
                setTimeout(() => window.location.href = "settings.html", 500);
                break;
            case '9': case 'nine': case 'exit':
                speak("Exiting app");
                setTimeout(() => window.location.href = "exit.html", 500);
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
