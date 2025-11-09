// =========================
// WeatherEase Settings JS
// =========================

document.addEventListener('DOMContentLoaded', () => {
  const darkMode = document.getElementById('dark-mode');
  const bigText = document.getElementById('big-text');
  const highContrast = document.getElementById('high-contrast');
  const voiceCheckbox = document.getElementById('voice');
  const unitsSelect = document.getElementById('units-select');
  const voiceSelect = document.getElementById('voice-select');
  const speechRate = document.getElementById('voice-rate');
  const speechPitch = document.getElementById('voice-pitch');
  const rateDisplay = document.getElementById('rate-display');
  const pitchDisplay = document.getElementById('pitch-display');
  const previewBtn = document.getElementById('preview-voice');
  const statusDiv = document.getElementById('voice-status');

  // ----------------------------
  // Load saved preferences
  // ----------------------------
  function loadSettings() {
    // Accessibility
    darkMode.checked = localStorage.getItem('darkMode') === 'true';
    bigText.checked = localStorage.getItem('bigText') === 'true';
    highContrast.checked = localStorage.getItem('highContrast') === 'true';
    voiceCheckbox.checked = localStorage.getItem('voiceEnabled') === 'true';
    unitsSelect.value = localStorage.getItem('units') || 'metric';

    if (darkMode.checked) document.body.classList.add('dark-mode');
    if (bigText.checked) document.documentElement.style.fontSize = '18px';
    if (highContrast.checked) document.body.style.filter = 'contrast(1.2)';

    // Voice
    speechRate.value = parseFloat(localStorage.getItem('speechRate')) || 1;
    speechPitch.value = parseFloat(localStorage.getItem('speechPitch')) || 1;
    rateDisplay.textContent = speechRate.value;
    pitchDisplay.textContent = speechPitch.value;
  }

  loadSettings();

  // ----------------------------
  // Accessibility toggles
  // ----------------------------
  darkMode.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkMode.checked);
    localStorage.setItem('darkMode', darkMode.checked);
  });

  bigText.addEventListener('change', () => {
    document.documentElement.style.fontSize = bigText.checked ? '18px' : '';
    localStorage.setItem('bigText', bigText.checked);
  });

  highContrast.addEventListener('change', () => {
    document.body.style.filter = highContrast.checked ? 'contrast(1.2)' : '';
    localStorage.setItem('highContrast', highContrast.checked);
  });

  voiceCheckbox.addEventListener('change', () => {
    localStorage.setItem('voiceEnabled', voiceCheckbox.checked);
  });

  unitsSelect.addEventListener('change', () => {
    localStorage.setItem('units', unitsSelect.value);
  });

  // ----------------------------
  // Populate voices
  // ----------------------------
  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;

    voiceSelect.innerHTML = '';
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v.name === localStorage.getItem('voiceName')) opt.selected = true;
      voiceSelect.appendChild(opt);
    });
  }

  populateVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // ----------------------------
  // Save voice settings
  // ----------------------------
  voiceSelect.addEventListener('change', () => {
    localStorage.setItem('voiceName', voiceSelect.value);
    if (statusDiv) statusDiv.textContent = `Voice set to ${voiceSelect.value}`;
  });

  speechRate.addEventListener('input', () => {
    rateDisplay.textContent = speechRate.value;
    localStorage.setItem('speechRate', speechRate.value);
  });

  speechPitch.addEventListener('input', () => {
    pitchDisplay.textContent = speechPitch.value;
    localStorage.setItem('speechPitch', speechPitch.value);
  });

  // ----------------------------
  // Preview voice button
  // ----------------------------
  previewBtn.addEventListener('click', () => {
    const utter = new SpeechSynthesisUtterance("This is a preview of your selected voice settings.");
    const selectedVoice = speechSynthesis.getVoices().find(v => v.name === voiceSelect.value);
    if (selectedVoice) utter.voice = selectedVoice;
    utter.rate = parseFloat(speechRate.value);
    utter.pitch = parseFloat(speechPitch.value);
    speechSynthesis.speak(utter);
  });
});

