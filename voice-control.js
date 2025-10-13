// =========================
// Voice Control System
// Works for Home and Settings pages
// =========================

window.addEventListener('DOMContentLoaded', () => {

  // ----------------------------
  // Grab elements from DOM
  // ----------------------------
  // Button to enable voice commands (home or settings page)
  const startVoiceBtn = document.getElementById('start-voice-btn') || document.getElementById('voice');

  // Status text to show user messages
  const voiceStatus = document.getElementById('voice-status');

  // SpeechSynthesis API
  const synth = window.speechSynthesis;

  // SpeechRecognition object
  let recognition;

  // Flag to indicate if voice commands are enabled
  let voiceEnabled = false;

  // ----------------------------
  // Speak text function
  // ----------------------------
  // Uses the Web Speech API to speak any string
  function speak(text) {
    if(!voiceEnabled) return;          // Do nothing if voice not enabled
    if(synth.speaking) synth.cancel(); // Stop any ongoing speech
    const utter = new SpeechSynthesisUtterance(text);
    synth.speak(utter);
  }

  // ----------------------------
  // Greet user with instructions
  // ----------------------------
  function greetUser() {
    const greeting = `Welcome to WeatherEase!
Say 1: Weather
Say 2: Settings
Say 9: Exit`;
    
    // Speak the greeting
    speak(greeting);

    // Update status text
    if(voiceStatus) voiceStatus.textContent = "Awaiting voice command...";
  }

  // ----------------------------
  // Start voice recognition
  // ----------------------------
  function startRecognition() {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      if(voiceStatus) voiceStatus.textContent = "Voice commands not supported in this browser.";
      return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';       // Set language
    recognition.interimResults = false; // Only final results
    recognition.maxAlternatives = 1;    // One possible result

    // Start listening
    recognition.start();

    // ----------------------------
    // Handle recognized speech
    // ----------------------------
    recognition.onresult = event => {
      // Take the first result, trim, and lowercase
      const command = event.results[0][0].transcript.trim().toLowerCase();
      handleVoiceCommand(command);
    };

    // Handle errors
    recognition.onerror = event => {
      if(voiceStatus) voiceStatus.textContent = `Error: ${event.error}`;
    };

    // Restart recognition automatically if enabled
    recognition.onend = () => {
      if(voiceEnabled) recognition.start();
    };
  }

  // ----------------------------
  // Handle commands
  // ----------------------------
  function handleVoiceCommand(cmd) {
    switch(cmd){
      case '1': 
      case 'one':
      case 'weather': 
      case 'get weather':
        speak("Opening Weather page");
        window.location.href = "weather.html";
        break;

      case '2': 
      case 'two':
      case 'settings':
        speak("Opening Settings page");
        window.location.href = "settings.html";
        break;

      case '9': 
      case 'nine':
      case 'exit':
        speak("Exiting app");
        window.location.href = "exit.html";
        break;

      default:
        speak("Command not recognized."); // Fallback for unknown commands
        break;
    }
  }

  // ----------------------------
  // Enable voice commands on button click
  // ----------------------------
  if(startVoiceBtn){
    startVoiceBtn.addEventListener('click', () => {
      voiceEnabled = true;   // Turn on voice
      greetUser();           // Speak greeting
      startRecognition();    // Start listening
      if(startVoiceBtn.id === 'voice') startVoiceBtn.style.display = "none"; // Hide button on settings page
    });
  }
});



