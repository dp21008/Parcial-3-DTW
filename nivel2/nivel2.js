const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

const statusMessage = document.getElementById("statusMessage");
const nextLevelBtn = document.getElementById("nextLevelBtn");

// Coordenadas guardadas en el nivel 1
const latitud = parseFloat(localStorage.getItem("userLatitude"));
const longitud = parseFloat(localStorage.getItem("userLongitude"));

// ========================
// LÍMITES GEOGRÁFICOS DEL MAPA (mapa.png)
// Calculados a partir de ciudades de referencia
// ========================
const LAT_MAX = 14.64;   // borde superior
const LAT_MIN = 13.16;   // borde inferior
const LNG_MIN = -90.23;  // borde izquierdo
const LNG_MAX = -87.64;  // borde derecho

// Animación
let animFrame = 0;

// Imagen del mapa
const mapaImg = new Image();
let mapaListo = false;


// ========================
// CONVERSIÓN GEO → PÍXELES
// ========================

function geoToPixel(lat, lng) {
    const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * canvas.width;
    const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * canvas.height;
    return { x, y };
}


// ========================
// INICIALIZACIÓN
// ========================

function init() {

    if (isNaN(latitud) || isNaN(longitud)) {
        statusMessage.textContent =
            "No se encontraron coordenadas del nivel 1.";
        dibujarPantallaSinDatos();
        return;
    }

    // Verificar que las coordenadas están dentro del rango del mapa
    if (latitud < LAT_MIN || latitud > LAT_MAX ||
        longitud < LNG_MIN || longitud > LNG_MAX) {
        statusMessage.textContent =
            "Las coordenadas están fuera del rango del mapa.";
    }

    // Cargar imagen del mapa
    statusMessage.textContent = "Estableciendo posición en el mapa...";

    mapaImg.onload = () => {
        mapaListo = true;
        statusMessage.textContent =
            "Posición establecida. Sigue la ruta roja hacia la meta.";
        nextLevelBtn.disabled = false;
        animar();
    };

    mapaImg.onerror = () => {
        statusMessage.textContent =
            "Error al cargar la imagen del mapa (mapa.png).";
        dibujarPantallaSinDatos();
    };

    mapaImg.src = "mapa.png";
}


function animar() {
    animFrame++;
    dibujarMapa();
    requestAnimationFrame(animar);
}


// ========================
// DIBUJO PRINCIPAL
// ========================

function dibujarMapa() {
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. Dibujar imagen del mapa real como fondo
    ctx.drawImage(mapaImg, 0, 0, W, H);

    // 2. Rectángulo
    dibujarRectangulo(W, H);

    // 3. Línea
    dibujarLinea(W, H);

    // 4. Círculo
    dibujarCirculo(W, H);

    // 5. Marcador de posición
    dibujarMarcador(W, H);

    // 6. Overlay decorativo
    dibujarOverlay(W, H);
}


// ===========================================
// FIGURAS GEOMÉTRICAS
// Temática de misión de videojuego
// ===========================================


// CÍRCULO — Punto de extracción (meta)
function dibujarCirculo(W, H) {
    const pos = geoToPixel(latitud, longitud);

    // Meta ubicada a la derecha-arriba del jugador
    const cx = pos.x + 120;
    const cy = pos.y - 70;
    const radio = 22;

    const pulso = Math.sin(animFrame * 0.05) * 0.2 + 0.8;

    ctx.save();

    // Resplandor exterior
    ctx.beginPath();
    ctx.arc(cx, cy, radio + 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(40, 200, 100, ${0.12 * pulso})`;
    ctx.fill();

    // Relleno
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(40, 200, 100, ${0.2 * pulso})`;
    ctx.fill();

    // Borde
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(40, 200, 100, ${0.9 * pulso})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Icono de meta (bandera)
    ctx.font = "14px serif";
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * pulso})`;
    ctx.fillText("🏁", cx, cy + 5);

    // Etiqueta
    ctx.font = "bold 10px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
    ctx.lineWidth = 3;
    ctx.strokeText("META", cx, cy + radio + 15);
    ctx.fillText("META", cx, cy + radio + 15);

    ctx.restore();
}


// LÍNEA — Ruta hacia la meta 
function dibujarLinea(W, H) {
    const pos = geoToPixel(latitud, longitud);

    // La ruta va del jugador hacia la meta (círculo)
    const metaX = pos.x + 120;
    const metaY = pos.y - 70;

    // Punto intermedio (pasa cerca de la zona de suministros)
    const midX = pos.x + 60;
    const midY = pos.y - 15;

    // Puntos de la ruta en orden
    const puntos = [
        { x: pos.x, y: pos.y },
        { x: midX, y: midY },
        { x: metaX, y: metaY },
    ];

    // Calcular longitud total de la ruta
    let totalLen = 0;
    for (let i = 1; i < puntos.length; i++) {
        const dx = puntos[i].x - puntos[i - 1].x;
        const dy = puntos[i].y - puntos[i - 1].y;
        totalLen += Math.sqrt(dx * dx + dy * dy);
    }

    // Progreso: ciclo lento (~5 segundos para dibujar, 1.5s de pausa)
    const ciclo = 390;       // frames totales del ciclo
    const dibujado = 300;    // frames para dibujar la ruta
    const frame = animFrame % ciclo;
    const progreso = Math.min(frame / dibujado, 1); // 0 → 1

    // Longitud visible actual
    const visibleLen = progreso * totalLen;

    ctx.save();

    // Calcular el punto final visible sobre la ruta
    let acum = 0;
    const puntosVisibles = [puntos[0]];

    for (let i = 1; i < puntos.length; i++) {
        const dx = puntos[i].x - puntos[i - 1].x;
        const dy = puntos[i].y - puntos[i - 1].y;
        const segLen = Math.sqrt(dx * dx + dy * dy);

        if (acum + segLen <= visibleLen) {
            // El segmento completo es visible
            puntosVisibles.push(puntos[i]);
            acum += segLen;
        } else {
            // Solo parte de este segmento es visible
            const restante = visibleLen - acum;
            const t = restante / segLen;
            puntosVisibles.push({
                x: puntos[i - 1].x + dx * t,
                y: puntos[i - 1].y + dy * t,
            });
            break;
        }
    }

    // Sombra de la ruta (solo la parte visible)
    if (puntosVisibles.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(puntosVisibles[0].x + 1, puntosVisibles[0].y + 2);
        for (let i = 1; i < puntosVisibles.length; i++) {
            ctx.lineTo(puntosVisibles[i].x + 1, puntosVisibles[i].y + 2);
        }
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // Línea punteada (solo la parte visible)
        ctx.beginPath();
        ctx.moveTo(puntosVisibles[0].x, puntosVisibles[0].y);
        for (let i = 1; i < puntosVisibles.length; i++) {
            ctx.lineTo(puntosVisibles[i].x, puntosVisibles[i].y);
        }
        ctx.setLineDash([8, 5]);
        ctx.strokeStyle = "#e63946";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Flecha solo cuando la ruta está completa
    if (progreso >= 1) {
        const ang = Math.atan2(metaY - midY, metaX - midX);
        ctx.save();
        ctx.translate(metaX, metaY);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-5, -5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fillStyle = "#e63946";
        ctx.fill();
        ctx.restore();
    }

    // Etiqueta "RUTA" (aparece cuando hay suficiente progreso)
    if (progreso > 0.3) {
        ctx.font = "bold 10px Arial, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.strokeText("RUTA", midX - 15, midY - 10);
        ctx.fillText("RUTA", midX - 15, midY - 10);
    }

    ctx.restore();
}


// RECTÁNGULO — Zona de suministros (plataforma interactiva)
function dibujarRectangulo(W, H) {
    const pos = geoToPixel(latitud, longitud);

    // Zona de suministros ubicada a medio camino de la ruta
    const rw = 50;
    const rh = 35;
    const rx = pos.x + 35;
    const ry = pos.y - 35;

    const pulso = Math.sin(animFrame * 0.04) * 0.15 + 0.85;

    ctx.save();

    // Resplandor exterior pulsante (efecto "párate aquí")
    ctx.fillStyle = `rgba(255, 170, 50, ${0.08 * pulso})`;
    ctx.fillRect(rx - 4, ry - 4, rw + 8, rh + 8);

    // Relleno principal
    ctx.fillStyle = `rgba(255, 170, 50, ${0.2 * pulso})`;
    ctx.fillRect(rx, ry, rw, rh);

    // Borde animado (marching ants sutil)
    ctx.strokeStyle = `rgba(255, 170, 50, ${0.9 * pulso})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.lineDashOffset = -(animFrame * 0.5);
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Esquinas reforzadas (marcadores de plataforma)
    ctx.strokeStyle = `rgba(255, 200, 80, ${0.9 * pulso})`;
    ctx.lineWidth = 2;
    const cl = 7;
    // Superior izquierda
    ctx.beginPath();
    ctx.moveTo(rx, ry + cl);
    ctx.lineTo(rx, ry);
    ctx.lineTo(rx + cl, ry);
    ctx.stroke();
    // Superior derecha
    ctx.beginPath();
    ctx.moveTo(rx + rw - cl, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.lineTo(rx + rw, ry + cl);
    ctx.stroke();
    // Inferior izquierda
    ctx.beginPath();
    ctx.moveTo(rx, ry + rh - cl);
    ctx.lineTo(rx, ry + rh);
    ctx.lineTo(rx + cl, ry + rh);
    ctx.stroke();
    // Inferior derecha
    ctx.beginPath();
    ctx.moveTo(rx + rw - cl, ry + rh);
    ctx.lineTo(rx + rw, ry + rh);
    ctx.lineTo(rx + rw, ry + rh - cl);
    ctx.stroke();

    // Icono de suministros
    ctx.font = "12px serif";
    ctx.textAlign = "center";
    ctx.fillText("📦", rx + rw / 2, ry + rh / 2 + 4);

    // Etiqueta superior
    ctx.font = "bold 9px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
    ctx.lineWidth = 3;
    ctx.strokeText("SUMINISTROS", rx + rw / 2, ry - 7);
    ctx.fillText("SUMINISTROS", rx + rw / 2, ry - 7);

    // Texto inferior "Párate aquí"
    ctx.font = "italic 7px Arial, sans-serif";
    ctx.fillStyle = `rgba(255, 220, 150, ${0.7 * pulso})`;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 2.5;
    ctx.strokeText("▸ Párate aquí ◂", rx + rw / 2, ry + rh + 12);
    ctx.fillText("▸ Párate aquí ◂", rx + rw / 2, ry + rh + 12);

    ctx.restore();
}


// ===========================================
// MARCADOR DE POSICIÓN 
// ===========================================

function dibujarMarcador(W, H) {
    const pos = geoToPixel(latitud, longitud);
    const pulso = Math.sin(animFrame * 0.06) * 0.3 + 0.7;

    ctx.save();

    // Sombra en el suelo
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 24, 10, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();

    // Resplandor pulsante
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 20 + pulso * 10, 0, Math.PI * 2);
    const glow = ctx.createRadialGradient(pos.x, pos.y, 4, pos.x, pos.y, 30);
    glow.addColorStop(0, `rgba(230, 57, 70, ${0.35 * pulso})`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fill();

    // Pin (forma de gota invertida)
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y + 22);
    ctx.bezierCurveTo(
        pos.x - 6, pos.y + 6,
        pos.x - 16, pos.y - 6,
        pos.x - 16, pos.y - 14
    );
    ctx.arc(pos.x, pos.y - 14, 16, Math.PI, 0, false);
    ctx.bezierCurveTo(
        pos.x + 16, pos.y - 6,
        pos.x + 6, pos.y + 6,
        pos.x, pos.y + 22
    );
    ctx.closePath();

    // Gradiente del pin
    const pinGrad = ctx.createLinearGradient(pos.x, pos.y - 30, pos.x, pos.y + 22);
    pinGrad.addColorStop(0, "#ff6666");
    pinGrad.addColorStop(0.35, "#e63946");
    pinGrad.addColorStop(0.7, "#c0202e");
    pinGrad.addColorStop(1, "#8a1420");
    ctx.fillStyle = pinGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Brillo lateral del pin
    ctx.beginPath();
    ctx.ellipse(pos.x - 6, pos.y - 18, 3, 9, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fill();

    // Borde del pin
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y + 22);
    ctx.bezierCurveTo(pos.x - 6, pos.y + 6, pos.x - 16, pos.y - 6, pos.x - 16, pos.y - 14);
    ctx.arc(pos.x, pos.y - 14, 16, Math.PI, 0, false);
    ctx.bezierCurveTo(pos.x + 16, pos.y - 6, pos.x + 6, pos.y + 6, pos.x, pos.y + 22);
    ctx.closePath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Círculo blanco interior
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 14, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 2;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Punto rojo central
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 14, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#e63946";
    ctx.fill();

    // Etiqueta "TU POSICIÓN"
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.textAlign = "center";

    const label = "TU POSICIÓN";
    const labelW = ctx.measureText(label).width + 18;

    // Fondo de etiqueta
    ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
    roundRect(ctx, pos.x - labelW / 2, pos.y - 52, labelW, 22, 5);
    ctx.fill();

    // Borde de etiqueta
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    roundRect(ctx, pos.x - labelW / 2, pos.y - 52, labelW, 22, 5);
    ctx.stroke();

    // Texto
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, pos.x, pos.y - 37);

    // Coordenadas debajo del pin
    ctx.font = "bold 9px Arial, sans-serif";
    const coordText = `${latitud.toFixed(5)}°N, ${Math.abs(longitud).toFixed(5)}°W`;

    // Fondo de coordenadas
    const coordW = ctx.measureText(coordText).width + 14;
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    roundRect(ctx, pos.x - coordW / 2, pos.y + 30, coordW, 18, 3);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(coordText, pos.x, pos.y + 43);

    ctx.restore();
}


// ========================
// OVERLAY DECORATIVO
// ========================

function dibujarOverlay(W, H) {
    ctx.save();

    // Viñeta sutil en los bordes
    const vig = ctx.createRadialGradient(
        W / 2, H / 2, Math.min(W, H) * 0.35,
        W / 2, H / 2, Math.max(W, H) * 0.72
    );
    vig.addColorStop(0, "transparent");
    vig.addColorStop(1, "rgba(13, 7, 23, 0.25)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Borde con glow
    ctx.strokeStyle = "#9d6cff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#9d6cff";
    ctx.shadowBlur = 8;
    ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
    ctx.shadowBlur = 0;

    // Borde interior decorativo
    ctx.strokeStyle = "rgba(157, 108, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(6, 6, W - 12, H - 12);
    ctx.setLineDash([]);

    // Esquinas decorativas (diamantes)
    const esquinas = [
        [10, 10], [W - 10, 10],
        [10, H - 10], [W - 10, H - 10]
    ];
    esquinas.forEach(([x, y]) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#9d6cff";
        ctx.shadowColor = "#9d6cff";
        ctx.shadowBlur = 6;
        ctx.fillRect(-4, -4, 8, 8);
        ctx.shadowBlur = 0;
        ctx.restore();

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#c7a7ff";
        ctx.fill();
    });

    // Brújula mini (esquina superior derecha)
    dibujarBrujula(W - 40, 38, 20);

    // Leyenda (esquina inferior izquierda)
    dibujarLeyenda(12, H - 102);

    ctx.restore();
}


// ========================
// BRÚJULA MINI
// ========================

function dibujarBrujula(cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);

    // Fondo
    ctx.beginPath();
    ctx.arc(0, 0, size + 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(0, 0, size + 3, 0, Math.PI * 2);
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Norte (rojo)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, -3);
    ctx.lineTo(0, -(size - 3));
    ctx.lineTo(4, -3);
    ctx.closePath();
    ctx.fillStyle = "#e63946";
    ctx.fill();

    // Sur
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, 3);
    ctx.lineTo(0, size - 3);
    ctx.lineTo(4, 3);
    ctx.closePath();
    ctx.fillStyle = "#bbb";
    ctx.fill();

    // Este y Oeste
    [[1, 0], [-1, 0]].forEach(([dx]) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(dx * 3, -3);
        ctx.lineTo(dx * (size - 3), 0);
        ctx.lineTo(dx * 3, 3);
        ctx.closePath();
        ctx.fillStyle = "#ccc";
        ctx.fill();
    });

    // Centro
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.stroke();

    // "N"
    ctx.font = "bold 8px Arial, sans-serif";
    ctx.fillStyle = "#e63946";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("N", 0, -(size + 4));

    ctx.restore();
}


// ========================
// LEYENDA
// ========================

function dibujarLeyenda(lx, ly) {
    const lw = 148;
    const lh = 90;

    ctx.save();

    // Fondo
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    roundRect(ctx, lx, ly, lw, lh, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(157, 108, 255, 0.4)";
    ctx.lineWidth = 1;
    roundRect(ctx, lx, ly, lw, lh, 5);
    ctx.stroke();

    // Título
    ctx.font = "bold 10px Arial, sans-serif";
    ctx.fillStyle = "#c7a7ff";
    ctx.textAlign = "left";
    ctx.fillText("LEYENDA", lx + 8, ly + 12);

    // Ítems de la misión
    const items = [
        { color: "#e63946", label: "Tu posición", type: "pin" },
        { color: "#e63946", label: "Ruta", type: "line" },
        { color: "rgba(255, 170, 50, 0.9)", label: "Suministros", type: "rect" },
        { color: "rgba(40, 200, 100, 0.9)", label: "Meta", type: "circle" },
    ];

    ctx.font = "9px Arial, sans-serif";

    items.forEach((item, i) => {
        const iy = ly + 28 + i * 15;

        if (item.type === "pin") {
            // Mini pin
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.moveTo(lx + 14, iy + 5);
            ctx.lineTo(lx + 11, iy - 1);
            ctx.arc(lx + 14, iy - 2, 3, Math.PI, 0, false);
            ctx.lineTo(lx + 14, iy + 5);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(lx + 14, iy - 2, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
        } else if (item.type === "line") {
            // Línea punteada roja
            ctx.beginPath();
            ctx.moveTo(lx + 8, iy);
            ctx.lineTo(lx + 20, iy);
            ctx.setLineDash([3, 2]);
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (item.type === "rect") {
            // Rectángulo naranja
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(lx + 8, iy - 4, 12, 8);
            ctx.fillStyle = "rgba(255, 170, 50, 0.2)";
            ctx.fillRect(lx + 8, iy - 4, 12, 8);
        } else {
            // Círculo verde
            ctx.beginPath();
            ctx.arc(lx + 14, iy, 5, 0, Math.PI * 2);
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "rgba(40, 200, 100, 0.2)";
            ctx.fill();
        }

        ctx.fillStyle = "#ddd";
        ctx.fillText(item.label, lx + 26, iy + 3);
    });

    ctx.restore();
}


// ========================
// PANTALLA SIN DATOS
// ========================

function dibujarPantallaSinDatos() {
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "#1a1030";
    ctx.fillRect(0, 0, W, H);

    ctx.font = "40px serif";
    ctx.textAlign = "center";
    ctx.fillText("⚠️", W / 2, H / 2 - 20);

    ctx.font = "11px Arial, sans-serif";
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText("Sin coordenadas", W / 2, H / 2 + 12);

    ctx.font = "9px Arial, sans-serif";
    ctx.fillStyle = "#9d6cff";
    ctx.fillText("Completa el Nivel 1 primero", W / 2, H / 2 + 32);
}


// ========================
// UTILIDADES
// ========================

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

//Evento para avanzar al siguiente nivel
nextLevelBtn.addEventListener("click", () => {


    window.location.href =
        "../nivel3/nivel3.html";


});

// ========================
// INICIAR
// ========================

init();