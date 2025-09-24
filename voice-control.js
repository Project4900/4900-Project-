// ---------------------------
// Existing voice-control setup
// ---------------------------
const voiceCheckbox = document.getElementById('voice');
const voiceStatus = document.getElementById('voice-status');
const focusBox = document.getElementById('focus-box');
const synth = window.speechSynthesis;
let focusableElements = [];

// ----------------
// Speak function
function speak(text, callback) {
    if (!text) return;
    if (synth.speaking) synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = callback;
    synth.speak(utter);
}

// ----------------
// Focus handling
function handleFocus(event) {
    const el = event.target;
    const label = el.getAttribute('aria-label');

    if (voiceCheckbox.checked && label) {
        speak(label);
        voiceStatus.textContent = `Focused on: ${label}`;
    }

    const rect = el.getBoundingClientRect();
    focusBox.style.display = 'block';
    focusBox.style.top = `${rect.top + window.scrollY - 4}px`;
    focusBox.style.left = `${rect.left + window.scrollX - 4}px`;
    focusBox.style.width = `${rect.width + 8}px`;
    focusBox.style.height = `${rect.height + 8}px`;
}

// ----------------
// Arrow key navigation
function handleArrowKeys(event) {
    if (!voiceCheckbox.checked) return;
    const currentIndex = focusableElements.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex;

    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            break;
        default:
            return;
    }

    event.preventDefault();
    focusableElements[nextIndex].focus();
}

// ----------------
// Start voice commands (focus + keyboard)
function startVoiceCommands() {
    console.log('Voice system started');
    focusableElements = Array.from(document.querySelectorAll('[aria-label]'));
    focusableElements.forEach(el => {
        el.setAttribute('tabindex', '0');
        el.addEventListener('focus', handleFocus);
    });
    document.addEventListener('keydown', handleArrowKeys);

    // Start the guided voice menu on home page
    if (document.body.contains(document.getElementById('get-temp'))) {
        VoiceMenu.welcome();
    }
}

// ----------------
// Stop voice commands
function stopVoiceCommands() {
    console.log('Voice system stopped');
    focusableElements.forEach(el => {
        el.removeEventListener('focus', handleFocus);
        el.removeAttribute('tabindex');
    });
    document.removeEventListener('keydown', handleArrowKeys);
    focusableElements = [];
    voiceStatus.textContent = '';
    focusBox.style.display = 'none';
}

// ----------------
// Checkbox event listener
voiceCheckbox?.addEventListener('change', () => {
    if (voiceCheckbox.checked) startVoiceCommands();
    else stopVoiceCommands();
});

// ---------------------------
// Guided voice menu for home page
// ---------------------------
const VoiceMenu = (() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    function startListening() {
        if (!SpeechRecognition) {
            alert("Your browser does not support voice recognition.");
            return;
        }
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim().toLowerCase();
            console.log("User said:", transcript);
            handleCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            speak("Sorry, I didn't catch that. Please try again.", startListening);
        };

        recognition.start();
    }

    function handleCommand(command) {
        switch (command) {
            case "1":
            case "one":
                speak("Opening weather page.", () => { window.location.href = "weather.html#current"; });
                break;
            case "2":
            case "two":
                speak("Opening settings.", () => { window.location.href = "weather.html#settings"; });
                break;
            case "3":
            case "three":
                speak("Getting current temperature.", () => {
                    document.getElementById('get-temp')?.click();
                });
                break;
            case "9":
            case "nine":
                speak("Exiting app.", () => { window.location.href = "exit.html"; });
                break;
            default:
                speak("Sorry, I didn't understand that. Please say 1, 2, 3, or 9.", startListening);
        }
    }

    function welcome() {
        const menuText = "Hello, welcome to WeatherEase! Here are your options: " +
            "To get weather, say 1. " +
            "To go to settings, say 2. " +
            "To get temperature, say 3. " +
            "To exit, say 9.";
        speak(menuText, startListening);
    }

    return { welcome };
})();
