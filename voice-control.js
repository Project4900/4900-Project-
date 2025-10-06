// ----------------------------
// Voice & Speech System Setup
// ----------------------------
const voiceStatus = document.getElementById('voice-status');
const synth = window.speechSynthesis;
let recognition;

// ----------------------------
// Speak function using SpeechSynthesis
// ----------------------------
function speak(text) {
  if (synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Greeting message
// ----------------------------
function greetUser() {
  const greeting = `Hello, welcome to WeatherEase! Here are the following choices:
  Get Weather, go to Settings, Get Temp, and Exit.
  To get weather say 1, to go to settings say 2, to get temp say 3, to exit say 9.`;

  const voiceCheckbox = document.getElementById('voice');
  if (voiceCheckbox?.checked) speak(greeting);
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    if (voiceStatus) voiceStatus.textContent = "Speech recognition not supported in this browser.";
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  if (voiceStatus) voiceStatus.textContent = "Listening for commands...";
  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.trim();
    console.log("Heard:", command);
    handleVoiceCommand(command);
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    if (voiceStatus) voiceStatus.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => {
    // Keep listening continuously only if checkbox still checked
    const voiceCheckbox = document.getElementById('voice');
    if (voiceCheckbox?.checked) recognition.start();
  };
}

// ----------------------------
// Handle voice commands
// ----------------------------
function handleVoiceCommand(command) {
  const cmd = command.toLowerCase();

  switch(cmd) {
    case '1':
    case 'one':
    case 'get weather':
      speak("Navigating to Weather page");
      window.location.href = "weather.html#current";
      break;
    case '2':
    case 'settings':
      speak("Navigating to Settings");
      window.location.href = "weather.html#settings";
      break;
    case '3':
    case 'get temp':
      speak("Getting temperature now");
      document.getElementById('get-temp-btn')?.click();
      break;
    case '9':
    case 'exit':
      speak("Exiting app");
      window.location.href = "exit.html";
      break;
    default:
      speak("Command not recognized, please try again.");
      break;
  }
}

// ----------------------------
// Auto-start voice system only after user enables checkbox
// ----------------------------
window.addEventListener('DOMContentLoaded', () => {
  const voiceCheckbox = document.getElementById('voice');

  // Greet immediately if checkbox already checked (optional)
  if (voiceCheckbox?.checked) greetUser();

  // Start voice recognition only when user enables it
  voiceCheckbox?.addEventListener('change', () => {
    if (voiceCheckbox.checked) {
      greetUser();
      startVoiceRecognition();
    } else {
      if (voiceStatus) voiceStatus.textContent = "Voice commands disabled.";
      recognition?.stop();
    }
  });
});




