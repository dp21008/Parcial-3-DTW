const startCameraBtn = document.getElementById("startCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusMessage = document.getElementById("statusMessage");
const photosContainer = document.getElementById("photosContainer");

let stream = null;
let photoCount = 0;

startCameraBtn.addEventListener("click", startCamera);
captureBtn.addEventListener("click", capturePhoto);
nextLevelBtn.addEventListener("click", () => {
    window.location.href = "../nivel4/nivel4.html";
});

function startCamera() {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        statusMessage.textContent =
            "Tu navegador no soporta acceso a la cámara.";
        return;
    }

    statusMessage.textContent = "Solicitando acceso a la cámara...";

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (mediaStream) {
            stream = mediaStream;
            video.srcObject = mediaStream;
            startCameraBtn.disabled = true;
            captureBtn.disabled = false;
            statusMessage.textContent =
                "Cámara activada. Presiona CAPTURAR FOTO para tomar una evidencia.";
        })
        .catch(function (err) {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                statusMessage.textContent =
                    "Permiso de cámara denegado. No se puede acceder a la cámara.";
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                statusMessage.textContent =
                    "Cámara no encontrada. Conecta una cámara e intenta de nuevo.";
            } else {
                statusMessage.textContent =
                    "Error al acceder a la cámara: " + err.message;
            }
        });
}

function capturePhoto() {

    if (!stream) {
        statusMessage.textContent =
            "La cámara no está activa. Presiona ACTIVAR CÁMARA primero.";
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");

    localStorage.setItem("level3_photo_" + photoCount, imageData);

    photoCount++;

    const img = document.createElement("img");
    img.src = imageData;
    img.alt = "Evidencia capturada";
    photosContainer.appendChild(img);

    localStorage.setItem("level3Completed", "true");
    nextLevelBtn.disabled = false;

    statusMessage.textContent =
        "Fotografía capturada y almacenada como evidencia.";
}

window.addEventListener("beforeunload", function () {
    if (stream) {
        stream.getTracks().forEach(function (track) {
            track.stop();
        });
    }
});
