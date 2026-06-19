// nivel5.js - Archivo principal para el Nivel 5 (Fase 1 completada)

const startBtn = document.getElementById("startBtn");
const uiCounter = document.getElementById("uiCounter");

// Contador para demostrar que la interfaz no se congela
let tick = 0;
setInterval(() => {
    uiCounter.textContent = ++tick;
}, 100);

startBtn.addEventListener("click", () => {
    alert("Iniciando procesamiento... (Lógica en desarrollo para la Fase 2)");
});
