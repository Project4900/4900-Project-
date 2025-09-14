console.log("WeatherEase App loaded");

// Toggle for dark mode
document.addEventListener('DOMContentLoaded', () => {
    const darkModeCheckbox = document.getElementById('dark-mode');

    // Apply saved dark mode
    if(localStorage.getItem('darkMode') === 'true'){
        document.body.classList.add('dark-mode');
        if(darkModeCheckbox) darkModeCheckbox.checked = true;
    }

    // Toggle dark mode if checkbox exists
    if(darkModeCheckbox){
        darkModeCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeCheckbox.checked);
            localStorage.setItem('darkMode', darkModeCheckbox.checked);
        });
    }
});
