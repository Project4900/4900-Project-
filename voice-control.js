//1. setup: grabbing HTML elements
const voiceCheckbox = document.getElementById('voice');
const voiceStatus = document.getElementById('voice-status');
const focusBox = document.getElementById('focus-box');
const synth = window.speechSynthesis;
// ----------------
//Speak function
//Tell the browser to read it loud, Example: 
//if text="Home button", the computer will speak that
function speak(text){
    if (synth.speaking) synth.concel();
    const utter = new SpeechSynthesisUtterance(text);
    synth.speak(utter);
}

// ----------------
//4. Start voice commands
// Finds all elements with aria-label and stores them.
// Listens for when an element gets focus -> run handleFocus()
//Listens for keyboard events -> run handleArrowKeys
function startVoiceCommands(){
    console.log('Voice system started');

focusableElements = Array.from(document.querySelectorAll('[aria-label]'));

   focusableElements.forEach(el => {
    el.setAttribute('tabindex', '0'); // Ensure focusable
    el.addEventListener('focus', handleFocus);
  });

  document.addEventListener('keydown', handleArrowKeys);
}

// ----------------
//5. Stop voice commands
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
// 6. When an element gets focus
function handleFocus(event) {
  const el = event.target;
  const label = el.getAttribute('aria-label');

  if (voiceCheckbox.checked && label) {
    speak(label);
    voiceStatus.textContent = `Focused on: ${label}`;
  }

  // Move the focus box
  const rect = el.getBoundingClientRect();
  focusBox.style.display = 'block';
  focusBox.style.top = `${rect.top + window.scrollY - 4}px`;
  focusBox.style.left = `${rect.left + window.scrollX - 4}px`;
  focusBox.style.width = `${rect.width + 8}px`;
  focusBox.style.height = `${rect.height + 8}px`;
}
// ----------------
// 7. Arrow key navigation
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
// only works if the voice mode is on
// Find which element is currently focused
// ---------------- 
// 8. Checkbox event listener
if (voiceCheckbox) {
  voiceCheckbox.addEventListener('change', () => {
    if (voiceCheckbox.checked) {
      startVoiceCommands();
    } else {
      stopVoiceCommands();
    }
  });
}
// When the user clicks the checkbox: 
// if checked -> turn voice system on.
// if unchecked -> turn voice system off
