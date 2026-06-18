//Definición de variables para el DOM

const locationBtn = document.getElementById("locationBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");
const statusMessage = document.getElementById("statusMessage");

//Evento para obtener la ubicación al hacer clic en el botón
locationBtn.addEventListener("click", getLocation);

//función para obtener la ubicación del usuario
function getLocation() {

//validación para verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {


        statusMessage.textContent =
            "Tu navegador no soporta geolocalización.";


        return;
    }


    statusMessage.textContent =
        "Obteniendo ubicación...";


    navigator.geolocation.getCurrentPosition(
        showPosition,
        showError
    );
}

//Función para mostrar la ubicación obtenida y almacenarla en el localStorage
function showPosition(position) {


    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    //aproximamos a 6 decimales
    latitude.textContent = lat.toFixed(6);
    longitude.textContent = lng.toFixed(6);


    localStorage.setItem("userLatitude", lat);
    localStorage.setItem("userLongitude", lng);


    localStorage.setItem("level1Completed", "true");


    statusMessage.textContent =
        "Ubicación obtenida correctamente.";


    nextLevelBtn.disabled = false;
}

//manejo de errores en caso de que la geolocalización falle
function showError(error) {


    switch (error.code) {


        case error.PERMISSION_DENIED:
            statusMessage.textContent =
                "Permiso de ubicación denegado.";
            break;


        case error.POSITION_UNAVAILABLE:
            statusMessage.textContent =
                "Ubicación no disponible.";
            break;


        case error.TIMEOUT:
            statusMessage.textContent =
                "Tiempo de espera agotado.";
            break;


        default:
            statusMessage.textContent =
                "Error desconocido.";
    }
}

//Evento para avanzar al siguiente nivel
nextLevelBtn.addEventListener("click", () => {


    window.location.href =
        "../nivel2/nivel2.html";


});