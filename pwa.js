let deferredPrompt;
const installBtn = document.getElementById('install-btn'); // Add a button in HTML

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome from showing the default prompt
    e.preventDefault();
    deferredPrompt = e;

    // Show your custom install button
    if (installBtn) installBtn.style.display = 'inline-block';
});

installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // Show the install prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
    installBtn.style.display = 'none';
});

// Optional: hide button if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('WeatherEase installed!');
    if (installBtn) installBtn.style.display = 'none';
});
