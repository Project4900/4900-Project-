console.log("WeatherEase App loaded");

// Toggle for dark mode
// Check localStorage on page load
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');

    // If the checkbox exists on this page, make sure it reflects the saved state
    const darkModeCheckbox = document.getElementById('dark-mode');
    if(darkModeCheckbox) darkModeCheckbox.checked = true;
}

// Add event listener only if the checkbox exists
const darkModeCheckbox = document.getElementById('dark-mode');
if(darkModeCheckbox){
    darkModeCheckbox.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkModeCheckbox.checked);
        localStorage.setItem('darkMode', darkModeCheckbox.checked);
    });
}
