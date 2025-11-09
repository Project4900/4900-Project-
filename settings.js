// =========================
// WeatherEase Settings JS
// =========================

document.addEventListener('DOMContentLoaded', () => {
  const darkMode = document.getElementById('dark-mode');
  const bigText = document.getElementById('big-text');
  const highContrast = document.getElementById('high-contrast');
  const voiceCheckbox = document.getElementById('voice');
  const tempUnit = document.getElementById('temp-unit');
  const voiceSelect = document.getElementById('voice-select');
  const speechRate = document.getElementById('speech-rate');
  const speechPitch = document.getElementById('speech-pitch');
  const rateDisplay = document.getElementById('rate-display');
  const pitchDisplay = document.getElementById('pitch-display');
  const previewBtn = document.getElementById('preview-voice');

  // ----------------------------
  // Load saved preferences
  // ----------------------------
  function loadSettings() {
    if (localStorage.getItem('darkMode') === 'true') {
      darkMode.checked = true;
      document.body.classList.add('dark-mode');
    }
    if (localStorage.getItem('bigText') === 'true') {
      bigText.checked = true;
      document.documentElement.style.fontSize = '18px';
    }
    if (localStorage.getItem('highContrast') === 'true') {
      highContrast.checked = true;
      document.body.style.filter = 'contrast(1.2)';
    }
    voiceCheckbox.checked = localStorage.getItem('voiceEnabled') === 'true';
    tempUnit.value = localStorage.getItem('tempUnit') || 'metric';
    speechRate.value = localStorage.getItem('speechRate') || 1;
    speechPitch.value = localStorage.getItem('speechPitch') || 1;
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

  // ----------------------------
  // Temperature unit
  // ----------------------------
  tempUnit.addEventListener('change', () => {
    localStorage.setItem('tempUnit', tempUnit.value);
  });

  // ----------------------------
  // Speech synthesis voices
  // ----------------------------
  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v.name === localStorage.getItem('preferredVoice')) opt.selected = true;
      voiceSelect.appendChild(opt);
    });
  }

  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }

  voiceSelect.addEventListener('change', () => {
    localStorage.setItem('preferredVoice', voiceSelect.value);
  });

  // ----------------------------
  // Speech rate & pitch
  // ----------------------------
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
