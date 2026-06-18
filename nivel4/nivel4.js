const startBtn        = document.getElementById("startBtn");
const nextLevelBtn    = document.getElementById("nextLevelBtn");
const statusMessage   = document.getElementById("statusMessage");
const progressSection = document.getElementById("progressSection");
const progressBar     = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressText    = document.getElementById("progressText");
const statsCard       = document.getElementById("statsCard");
const uiCounter       = document.getElementById("uiCounter");

// Contador que prueba que la interfaz NO se congela mientras el Worker trabaja
let tick = 0;
setInterval(() => {
    uiCounter.textContent = ++tick;
}, 100);

startBtn.addEventListener("click", startSimulation);

nextLevelBtn.addEventListener("click", () => {
    window.location.href = "../nivel5/nivel5.html";
});

// Genera 20,000 registros simulados de dos sensores virtuales
function generateSensorData() {
    const data = [];
    for (let i = 0; i < 20000; i++) {
        data.push({
            id:          i + 1,
            temperatura: +(15 + Math.random() * 30).toFixed(2),  // 15 – 45 °C
            humedad:     +(20 + Math.random() * 75).toFixed(2)   // 20 – 95 %
        });
    }
    return data;
}

function startSimulation() {
    startBtn.disabled = true;
    statusMessage.textContent = "Generando 20,000 registros de sensores virtuales...";

    const data = generateSensorData();

    progressSection.style.display = "block";
    statusMessage.textContent = "Datos generados. Enviando al Worker para procesamiento paralelo...";

    const worker = new Worker("worker4.js");
    worker.postMessage(data);

    worker.onmessage = function (e) {
        const msg = e.data;

        if (msg.type === "progress") {
            progressBar.style.width = msg.percent + "%";
            progressBar.setAttribute("aria-valuenow", msg.percent);
            progressPercent.textContent = msg.percent + "%";
            progressText.textContent =
                msg.processed.toLocaleString("es") + " / 20,000 registros";

        } else if (msg.type === "result") {
            progressBar.style.width = "100%";
            progressBar.setAttribute("aria-valuenow", 100);
            progressPercent.textContent = "100%";
            progressText.textContent = "20,000 / 20,000 registros";

            displayStats(msg);
            worker.terminate();
        }
    };

    worker.onerror = function (err) {
        statusMessage.textContent = "Error en el Worker: " + err.message;
        startBtn.disabled = false;
    };
}

function displayStats(results) {
    document.getElementById("tempAvg").textContent =
        results.temperatura.promedio.toFixed(4) + " °C";
    document.getElementById("tempMax").textContent =
        results.temperatura.maximo.toFixed(2) + " °C";
    document.getElementById("tempMin").textContent =
        results.temperatura.minimo.toFixed(2) + " °C";

    document.getElementById("humAvg").textContent =
        results.humedad.promedio.toFixed(4) + " %";
    document.getElementById("humMax").textContent =
        results.humedad.maximo.toFixed(2) + " %";
    document.getElementById("humMin").textContent =
        results.humedad.minimo.toFixed(2) + " %";

    statsCard.style.display = "block";
    statsCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

    localStorage.setItem("level4Completed", "true");
    nextLevelBtn.disabled = false;

    statusMessage.textContent =
        "Procesamiento completado. Estadísticas calculadas correctamente.";
}
