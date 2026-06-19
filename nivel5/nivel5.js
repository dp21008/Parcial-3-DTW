// nivel5.js - Archivo principal para el Nivel 5

const startBtn = document.getElementById("startBtn");
const uiCounter = document.getElementById("uiCounter");
const statusMessage = document.getElementById("statusMessage");
const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");
const statsCard = document.getElementById("statsCard");

// Elementos de la Card
const validRecordsCount = document.getElementById("validRecordsCount");
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
    return data;
}

startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    statusMessage.textContent = "Generando 250,000 registros... por favor espere.";
    
    // Usamos setTimeout para permitir que el DOM se actualice antes de bloquear el hilo principal con la generación
    setTimeout(() => {
        const rawData = generateMassiveData();
        
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
                progressBar.style.width = "100%";
                progressBar.setAttribute("aria-valuenow", 100);
                progressPercent.textContent = "100%";
                progressText.textContent = "Procesamiento finalizado";
                
                progressBar.classList.remove("progress-bar-animated");

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
    if (!globalResultData) return;

    // Crear un Blob con la cadena JSON
    const jsonString = JSON.stringify(globalResultData, null, 4);
    const blob = new Blob([jsonString], { type: "application/json" });
    
    // Crear URL temporal y disparar la descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resultados_portal_cuantico.json";
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
