// Procesa los datos en bloques para poder enviar actualizaciones de progreso
// al hilo principal sin bloquear el Worker entre chunks.

const CHUNK = 2000; // registros por bloque

self.onmessage = function (e) {
    const data  = e.data;
    const total = data.length;

    let tempSum = 0, tempMax = -Infinity, tempMin = Infinity;
    let humSum  = 0, humMax  = -Infinity, humMin  = Infinity;

    function processChunk(start) {
        const end = Math.min(start + CHUNK, total);

        for (let i = start; i < end; i++) {
            const r = data[i];

            tempSum += r.temperatura;
            if (r.temperatura > tempMax) tempMax = r.temperatura;
            if (r.temperatura < tempMin) tempMin = r.temperatura;

            humSum += r.humedad;
            if (r.humedad > humMax) humMax = r.humedad;
            if (r.humedad < humMin) humMin = r.humedad;
        }

        const processed = end;
        const percent   = Math.round((processed / total) * 100);

        // Notificar progreso al hilo principal
        self.postMessage({ type: "progress", percent, processed });

        if (end < total) {
            // Pausa de 15 ms entre bloques para que el hilo principal pueda
            // renderizar la barra de progreso y mantener la UI responsiva.
            setTimeout(() => processChunk(end), 15);
        } else {
            // Enviar resultado final
            self.postMessage({
                type: "result",
                temperatura: {
                    promedio: tempSum / total,
                    maximo:   tempMax,
                    minimo:   tempMin
                },
                humedad: {
                    promedio: humSum / total,
                    maximo:   humMax,
                    minimo:   humMin
                },
                total
            });
        }
    }

    processChunk(0);
};
