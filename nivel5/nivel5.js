// nivel5.js - Archivo principal para el Nivel 5

(() => {
const startBtn = document.getElementById("startBtn");
const levelDescription = document.getElementById("levelDescription");
const uiCounter = document.getElementById("uiCounter");
const statusMessage = document.getElementById("statusMessage");
const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");
const statsCard = document.getElementById("statsCard");

// Elementos de la Card
const validRecordsCount = document.getElementById("validRecordsCount");
const totalRecordsCount = document.getElementById("totalRecordsCount");
const invalidRecordsCount = document.getElementById("invalidRecordsCount");
const avgTemp = document.getElementById("avgTemp");
const avgHum = document.getElementById("avgHum");
const avgPres = document.getElementById("avgPres");
const top10TempList = document.getElementById("top10TempList");
const top10PresList = document.getElementById("top10PresList");
const downloadBtn = document.getElementById("downloadBtn");
const successMessage = document.getElementById("successMessage");

// Variables globales
let globalResultData = null;

// Contador para demostrar que la interfaz no se congela
let tick = 0;
setInterval(() => {
    uiCounter.textContent = ++tick;
}, 100);

// Genera 250,000 registros simulados con algunos valores negativos aleatorios
function generateMassiveData() {
    console.log("[Nivel 5] Iniciando generación masiva de 250,000 registros...");
    const data = [];
    for (let i = 0; i < 250000; i++) {
        // Generar valores válidos
        let temp = +(10 + Math.random() * 30).toFixed(2); // 10 a 40 °C
        let hum = +(30 + Math.random() * 60).toFixed(2);  // 30 a 90 %
        let pres = +(900 + Math.random() * 200).toFixed(2); // 900 a 1100 hPa

        // Introducir intencionalmente valores negativos (~5% de probabilidad)
        if (Math.random() < 0.05) {
            const errorType = Math.floor(Math.random() * 3);
            if (errorType === 0) temp = -Math.random() * 50;
            else if (errorType === 1) hum = -Math.random() * 50;
            else pres = -Math.random() * 50;
        }

        data.push({
            id: i + 1,
            temperatura: temp,
            humedad: hum,
            presion: pres
        });
    }
    console.log("[Nivel 5] Generación completa. Array resultante con longitud:", data.length);
    return data;
}

startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    statusMessage.textContent = "Generando 250,000 registros... por favor espere.";
    
    // Usamos setTimeout para permitir que el DOM se actualice antes de bloquear el hilo principal con la generación
    setTimeout(() => {
        const rawData = generateMassiveData();
        
        console.log("[Nivel 5] Enviando datos al Web Worker...");
        statusMessage.textContent = "Datos generados. Iniciando procesamiento en Portal Cuántico (Web Worker)...";
        progressSection.style.display = "block";
        statsCard.style.display = "none";
        successMessage.style.display = "none";
        
        // Iniciar Web Worker
        const worker = new Worker("worker5.js");
        worker.postMessage(rawData);

        worker.onmessage = function (e) {
            const msg = e.data;

            if (msg.type === "progress") {
                progressBar.style.width = msg.percent + "%";
                progressBar.setAttribute("aria-valuenow", msg.percent);
                progressPercent.textContent = msg.percent + "%";
                progressText.textContent = msg.processed.toLocaleString("es") + " / 250,000 registros";

            } else if (msg.type === "result") {
                console.log("[Nivel 5] Worker finalizó y retornó resultados:", msg.data);
                
                // Ocultar los elementos de carga y el botón para dejar la interfaz limpia
                progressSection.style.display = "none";
                startBtn.style.display = "none";
                statusMessage.style.display = "none";
                levelDescription.style.display = "none";

                // Guardar los resultados globalmente para poder descargarlos en Fase 4
                globalResultData = msg.data;

                // Mostrar interfaz final
                displayFinalResults(globalResultData);
                
                statusMessage.textContent = "¡Análisis del Portal Cuántico completado!";
                successMessage.style.display = "block";
                
                worker.terminate();
            }
        };

        worker.onerror = function (err) {
            statusMessage.textContent = "Error en el Worker: " + err.message;
            startBtn.disabled = false;
        };

    }, 50);
});

// Función para poblar la UI con los resultados calculados
function displayFinalResults(data) {
    validRecordsCount.textContent = data.totalValid.toLocaleString("es");
    totalRecordsCount.textContent = data.totalProcessed.toLocaleString("es");
    invalidRecordsCount.textContent = data.totalInvalid.toLocaleString("es");

    avgTemp.textContent = data.averages.temperatura.toFixed(2) + " °C";
    avgHum.textContent = data.averages.humedad.toFixed(2) + " %";
    avgPres.textContent = data.averages.presion.toFixed(2) + " hPa";

    // Llenar listas de Top 10
    top10TempList.innerHTML = "";
    data.top10Temperatura.forEach(t => {
        const li = document.createElement("li");
        li.textContent = t.toFixed(2) + " °C";
        top10TempList.appendChild(li);
    });

    top10PresList.innerHTML = "";
    data.top10Presion.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p.toFixed(2) + " hPa";
        top10PresList.appendChild(li);
    });

    statsCard.style.display = "block";
    statsCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Implementación de la exportación a JSON
downloadBtn.addEventListener("click", () => {
    if (!globalResultData) {
        console.warn("[Nivel 5] Intento de descarga sin datos disponibles.");
        return;
    }
    console.log("[Nivel 5] Generando Blob JSON para exportación...");

    // Crear un Blob con la cadena JSON
    const jsonString = JSON.stringify(globalResultData, null, 4);
    const blob = new Blob([jsonString], { type: "application/json" });
    
    // Crear URL temporal y disparar la descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Generar nombre de archivo con marca de tiempo
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    a.download = `resultados_portal_cuantico_${timestamp}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

})(); // Fin de la función autoejecutable (IIFE)
