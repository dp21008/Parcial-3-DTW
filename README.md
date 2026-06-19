# Escape Room Javascript - La Cámara de los Cinco Desafíos

Bienvenido al repositorio del **Examen Parcial #3** para la materia *Desarrollo y Técnicas de Aplicaciones Web* de la Universidad de El Salvador (FMOcc).

Este proyecto consiste en una aplicación web interactiva que simula un "Escape Room" tecnológico. El objetivo es superar cinco niveles consecutivos utilizando únicamente tecnologías frontend estándar (Vanilla JavaScript, HTML5, CSS3 y Bootstrap) sin el uso de frameworks externos o backends.

## 🚀 Niveles del Desafío

* **Nivel 1: El Guardián de la Ubicación** - Obtención de geolocalización y manejo de promesas/permisos.
* **Nivel 2: El Cartógrafo Perdido** - Renderizado de elementos y mapeo de coordenadas utilizando `Canvas API`.
* **Nivel 3: La Evidencia del Explorador** - Captura de fotografía mediante la `MediaDevices API` (cámara web) y persistencia de datos en `LocalStorage`.
* **Nivel 4: El Núcleo de Procesamiento** - Simulación y procesamiento asíncrono de 20,000 registros.
* **Nivel 5: El Portal Cuántico (Nivel Final)** - Análisis masivo asíncrono y exportación de datos.

## 🔬 Destacado: Implementación del Nivel 5

El Nivel 5 demuestra el poder del procesamiento multihilo en el navegador utilizando **Web Workers** para evitar el bloqueo del *Main Thread*:
- **Generación Masiva:** Creación de 250,000 registros ambientales simulados al vuelo.
- **Filtrado Asíncrono:** Limpieza y descarte de mediciones erróneas (valores negativos introducidos intencionalmente).
- **Estadísticas Optimizadas:** Cálculos de promedios generales y extracción de un "Top 10" mediante algoritmos nativos (`Array.prototype.sort()`) de alto rendimiento de V8.
- **Interfaz Fluida (Non-Blocking UI):** La interfaz nunca se congela (comprobado visualmente mediante un contador en tiempo real) mientras el *Worker* emite eventos de progreso para actualizar la barra de carga dinámicamente.
- **Exportación en Memoria:** Generación de un archivo físico descargable (`.json`) a través de la interfaz `Blob` sin depender de servidores.

## 🛠️ Cómo ejecutar este proyecto

Dado que los niveles avanzados dependen de **Web Workers**, abrir el proyecto haciendo doble clic (`file://`) generará bloqueos de seguridad por CORS en los navegadores modernos. 

Para ejecutarlo correctamente, es indispensable arrancar un servidor HTTP local en la carpeta raíz del proyecto.

**Con VS Code:**
Utiliza la extensión **Live Server** dando clic derecho sobre `index.html`.

**Con Python:**
```bash
python -m http.server 8080
```
Luego visita `http://localhost:8080` en tu navegador.

**Con Node.js:**
```bash
npx serve
```

## 👥 Equipo de Desarrollo
* Ángel Josué Cortez Zaldaña (CZ23002)
* Gerson Balmore López Rodríguez (LR20029)
* Julio César Dávila Peñate (DP21008)
* Katya Michelle Asencio Bernal (AB23007)
* Kevin Armando Rivera Henríquez (RH16042)
