document.addEventListener('DOMContentLoaded', () => {
    // Determinar la ruta base para los assets según si estamos en la raíz o en una carpeta de nivel
    const pathParts = window.location.pathname.split('/');
    const isRoot = pathParts[pathParts.length - 1] === 'index.html' || pathParts[pathParts.length - 1] === '';
    // Si estamos en un nivel, necesitamos retroceder un directorio para encontrar assets
    const basePath = isRoot ? './assets/' : '../assets/';

    const audio = new Audio(`${basePath}audio/bg-music.mp3`);
    audio.loop = true;
    audio.volume = 0.4;

    // Restaurar estado: Si es la primera visita (null), lo activamos por defecto.
    let isPlayingStr = localStorage.getItem('bgMusicPlaying');
    if (isPlayingStr === null) {
        localStorage.setItem('bgMusicPlaying', 'true');
        isPlayingStr = 'true';
    }
    const isPlaying = isPlayingStr === 'true';
    const savedTime = localStorage.getItem('bgMusicTime');

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    // Creación de la UI
    const widget = document.createElement('div');
    widget.id = 'audio-widget';
    
    const btn = document.createElement('button');
    btn.id = 'audio-toggle-btn';
    
    function updateBtnUI() {
        btn.innerHTML = audio.paused ? '🔈 <span class="audio-text">BGM: OFF</span>' : '🔊 <span class="audio-text">BGM: ON</span>';
        if (audio.paused) {
            btn.classList.remove('is-playing');
        } else {
            btn.classList.add('is-playing');
        }
    }

    // Intentar reproducir automáticamente si estaba reproduciéndose antes o por defecto
    if (isPlaying) {
        audio.play().then(() => {
            updateBtnUI();
        }).catch(err => {
            console.log('Autoplay bloqueado por el navegador, requiere interacción del usuario.', err);
            updateBtnUI();
            
            // Truco para autoplay: Escuchar el primer clic en CUALQUIER parte de la página para arrancar
            const playOnInteract = () => {
                if (localStorage.getItem('bgMusicPlaying') === 'true') {
                    audio.play().then(() => updateBtnUI()).catch(e => {});
                }
                document.removeEventListener('click', playOnInteract);
            };
            document.addEventListener('click', playOnInteract);
        });
    } else {
        updateBtnUI();
    }

    // Control de usuario
    btn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            localStorage.setItem('bgMusicPlaying', 'true');
        } else {
            audio.pause();
            localStorage.setItem('bgMusicPlaying', 'false');
        }
        updateBtnUI();
    });

    widget.appendChild(btn);
    document.body.appendChild(widget);

    // Guardar el tiempo actual al cambiar de página para que sea continuo
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('bgMusicTime', audio.currentTime);
        if (!audio.paused) {
            localStorage.setItem('bgMusicPlaying', 'true');
        }
    });
    
    // Si el usuario usa el botón "Atrás" del navegador, la página se carga desde el caché (bfcache).
    // Necesitamos actualizar el tiempo y reanudar la música.
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            const currentSavedTime = localStorage.getItem('bgMusicTime');
            const shouldPlay = localStorage.getItem('bgMusicPlaying') === 'true';
            
            if (currentSavedTime) {
                audio.currentTime = parseFloat(currentSavedTime);
            }
            
            if (shouldPlay && audio.paused) {
                audio.play().catch(e => {});
                updateBtnUI();
            }
        }
    });
    
    // Guardado periódico por si acaso
    setInterval(() => {
        if (!audio.paused) {
            localStorage.setItem('bgMusicTime', audio.currentTime);
        }
    }, 500);
});
