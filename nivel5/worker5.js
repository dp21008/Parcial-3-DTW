// worker5.js - Web Worker para el Nivel 5

self.onmessage = function(e) {
    const data = e.data;
    const totalRecords = data.length;
    
    console.log(`[Worker] Recibidos ${totalRecords} registros para procesamiento.`);
    
    let validRecordsCount = 0;
    let sumTemp = 0, sumHum = 0, sumPres = 0;
    
    // Arreglos para recopilar y luego extraer los Top 10
    const validTemps = [];
    const validPressures = [];
    
    // Tamaño del bloque para reportar progreso (ej. cada 5%)
    const chunkSize = Math.floor(totalRecords / 20);
    
    for (let i = 0; i < totalRecords; i++) {
        const item = data[i];
        
        // Filtrar valores negativos
        if (item.temperatura >= 0 && item.humedad >= 0 && item.presion >= 0) {
            validRecordsCount++;
            sumTemp += item.temperatura;
            sumHum += item.humedad;
            sumPres += item.presion;
            
            validTemps.push(item.temperatura);
            validPressures.push(item.presion);
        }

        // Reportar progreso periódico a la UI
        if (i % chunkSize === 0 && i !== 0) {
            const percent = Math.floor((i / totalRecords) * 100);
            self.postMessage({
                type: "progress",
                percent: percent,
                processed: i
            });
        }
    }
    
    // Para asegurarse de que la barra llegue al 100% justo antes del cálculo final (que es rápido)
    self.postMessage({
        type: "progress",
        percent: 100,
        processed: totalRecords
    });
    
    // Ordenar de mayor a menor para obtener el Top 10
    // (En V8 el .sort de arrays nativos es sumamente rápido, incluso para ~240k elementos)
    validTemps.sort((a, b) => b - a);
    validPressures.sort((a, b) => b - a);
    
    const top10Temp = validTemps.slice(0, 10);
    const top10Pres = validPressures.slice(0, 10);
    
    // Calcular promedios generales y redondear a 2 decimales para una exportación JSON limpia
    const avgTemp = validRecordsCount > 0 ? +(sumTemp / validRecordsCount).toFixed(2) : 0;
    const avgHum  = validRecordsCount > 0 ? +(sumHum / validRecordsCount).toFixed(2) : 0;
    const avgPres = validRecordsCount > 0 ? +(sumPres / validRecordsCount).toFixed(2) : 0;
    
    console.log(`[Worker] Filtrado completo. Registros válidos: ${validRecordsCount}. Promedios calculados y Tops extraídos.`);
    
    // Retornar resultados al hilo principal
    self.postMessage({
        type: "result",
        data: {
            totalProcessed: totalRecords,
            totalValid: validRecordsCount,
            totalInvalid: totalRecords - validRecordsCount,
            averages: {
                temperatura: avgTemp,
                humedad: avgHum,
                presion: avgPres
            },
            top10Temperatura: top10Temp.map(t => +t.toFixed(2)),
            top10Presion: top10Pres.map(p => +p.toFixed(2))
        }
    });
};
