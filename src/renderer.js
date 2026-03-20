// Because Monaco is an AMD module and Electron doesn't support it directly from file easily,
// we will load it via a local static script or simple iframe if needed.
// Actually, since nodeIntegration is false, we can load monaco's loader script.

let editor;
let currentFormat = 'svg';

document.addEventListener('DOMContentLoaded', () => {
  // Simple initialization for Monaco Editor
  const amdLoaderScript = document.createElement('script');
  amdLoaderScript.src = 'node_modules/monaco-editor/min/vs/loader.js';
  
  amdLoaderScript.onload = () => {
    require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
    require(['vs/editor/editor.main'], function () {
      editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: `@startuml
' === CONFIGURACIÓN GLOBAL (ESTILO DRACULA) ===
skinparam backgroundColor transparent
skinparam roundcorner 8
skinparam classBackgroundColor #282A36
skinparam classBorderColor #FF79C6
skinparam classFontColor #50FA7B
skinparam classAttributeFontColor #F8F8F2
skinparam defaultFontColor #F8F8F2
skinparam arrowColor #BD93F9
skinparam arrowFontColor #F8F8F2
skinparam noteBackgroundColor #44475A
skinparam noteBorderColor #FFB86C
skinparam noteFontColor #F8F8F2

' Muestra los íconos clásicos (+, -, #, ~)
skinparam classAttributeIconSize 0
' Permite que las relaciones cruzadas se vean más limpias
skinparam linetype ortho

title Modelo de Dominio Integral: Motor Gráfico UML (Cheat Sheet POO)

' ==========================================
' 1. PAQUETES (Namespaces) - Agrupación lógica
' ==========================================
package "com.graficador.core" {

    ' ==========================================
    ' 2. INTERFACES Y ENUMERACIONES
    ' ==========================================
    interface Renderizable <<Interface>> {
        + dibujar(contexto: Grafico2D): void
    }

    interface Exportable <<Interface>> {
        + exportar(formato: String): byte[]
    }

    enum TipoRelacion <<Enumeration>> {
        ASOCIACION
        HERENCIA
        COMPOSICION
        AGREGACION
        DEPENDENCIA
    }

    ' ==========================================
    ' 3. CLASES GENÉRICAS (Templates)
    ' ==========================================
    class GestorColecciones<T> {
        - elementos: List<T>
        + agregarElemento(e: T): void
        + filtrar(criterio: String): List<T>
    }

    ' ==========================================
    ' 4. CLASES ABSTRACTAS Y HERENCIA
    ' ==========================================
    abstract class ElementoGrafico <<Abstract>> {
        # id: UUID
        # coordenadaX: int
        # coordenadaY: int
        - bloqueado: boolean
        
        {abstract} + calcularAreaGeometrica(): double
        + mover(nuevaX: int, nuevaY: int): void
        + isBloqueado(): boolean
    }

    ' ==========================================
    ' 5. CLASES CONCRETAS E INTERNAS
    ' ==========================================
    class NodoClase <<Entity>> {
        - nombreClase: String
        - atributos: List<String>
        - metodos: List<String>
        
        + calcularAreaGeometrica(): double
        + dibujar(contexto: Grafico2D): void
    }

    ' Clase Interna (Anidada dentro de NodoClase)
    class MetodoFirma <<Nested>> {
        + nombre: String
        + tipoRetorno: String
    }
    NodoClase +-- MetodoFirma : <<inner>>

    class EnlaceRelacion <<Entity>> {
        - tipo: TipoRelacion
        
        + calcularAreaGeometrica(): double
        + dibujar(contexto: Grafico2D): void
    }
}

package "com.graficador.ui" {

    class PaletaColores {
        - coloresActivos: List<String>
        + obtenerHexadecimal(nombre: String): String
    }

    class LienzoTrabajo <<Component>> {
        + {static} MAX_ZOOM_LEVEL: float = 3.0
        ~ nivelZoomActual: float
        
        + renderizarTodo(): void
    }

    ' ==========================================
    ' 6. PATRONES DE DISEÑO CLÁSICOS (Singleton)
    ' ==========================================
    class GestorHerramientas << (S,#FF7700) Singleton >> {
        - {static} instancia: GestorHerramientas
        - herramientaActiva: String
        
        - GestorHerramientas()
        + {static} getInstancia(): GestorHerramientas
    }
}

package "com.graficador.io" {
    class MotorExportacion <<Service>> {
        + exportar(formato: String): byte[]
    }
}

' ==========================================
' 7. RELACIONES Y CONCEPTOS AVANZADOS
' ==========================================

' Realización (Implementación de Interfaces)
Renderizable <|.. ElementoGrafico
Exportable <|.. MotorExportacion

' Generalización (Herencia de Clases)
ElementoGrafico <|-- NodoClase
ElementoGrafico <|-- EnlaceRelacion

' Composición (Relación fuerte). Objeto dependiente.
LienzoTrabajo "1" *-- "0..*" ElementoGrafico : contiene >

' Agregación (Relación débil). Objeto independiente.
LienzoTrabajo "1" o-- "1" PaletaColores : usa >

' Asociación Unidireccional y Bidireccional
EnlaceRelacion "*" --> "1" NodoClase : origen
EnlaceRelacion "*" --> "1" NodoClase : destino
LienzoTrabajo "1" -- "1" GestorHerramientas : notifica >

' Dependencia (Uso temporal)
MotorExportacion ..> LienzoTrabajo : <<uses>>

' ==========================================
' 8. CLASE DE ASOCIACIÓN (Association Class)
' ==========================================
class HistorialEdicion {
    - fechaModificacion: Date
    - usuarioActivo: String
}
(LienzoTrabajo, ElementoGrafico) .. HistorialEdicion

' ==========================================
' 9. NOTAS (Documentación en diagrama)
' ==========================================
note right of HistorialEdicion
  Clase de Asociación: 
  Guarda metadatos de la relación 
  entre Lienzo y cada Elemento.
end note

note top of GestorHerramientas
  Patrón Singleton:
  Constructor privado y acceso global.
  (Atención al Icono Naranja "S")
end note
@enduml`,
        language: 'plaintext',
        theme: 'vs-dark',
        automaticLayout: true,
        wordWrap: 'on'
      });
      
      // Auto renderer on load
      requestRender();
    });
  };
  document.body.appendChild(amdLoaderScript);

  // Setup UI behaviors
  const formatSelect = document.getElementById('format-select');
  const renderBtn = document.getElementById('render-btn');
  const exportBtn = document.getElementById('export-btn');
  const previewContainer = document.getElementById('preview-container');
  const previewContent = document.getElementById('preview-content');

  // --- PAN & ZOOM LOGIC ---
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;

  function updateTransform() {
    previewContent.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  previewContainer.addEventListener('wheel', (e) => {
    // Zoom in/out without explicitly holding Ctrl, tracking scroll wheel globally inside canvas
    e.preventDefault();
    const zoomSensitivity = 0.002;
    scale -= e.deltaY * zoomSensitivity;
    scale = Math.min(Math.max(0.1, scale), 10);
    updateTransform();
  });

  previewContainer.addEventListener('mousedown', (e) => {
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    previewContainer.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    previewContainer.style.cursor = 'default';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform();
  });
  // -------------------------

  formatSelect.addEventListener('change', (e) => {
    currentFormat = e.target.value;
    requestRender();
  });

  renderBtn.addEventListener('click', requestRender);

  exportBtn.addEventListener('click', async () => {
    const contentDiv = document.getElementById('preview-content');
    let bufferData = null;
    
    if (currentFormat === 'svg') {
      bufferData = contentDiv.innerHTML; // SVG is plain text
    } else {
      const img = contentDiv.querySelector('img');
      if (img) {
        bufferData = img.src; // Data URI for PNG
      }
    }

    if (!bufferData) {
      alert("Nothing to export yet.");
      return;
    }

    const result = await window.electronAPI.exportDiagram({ bufferData, format: currentFormat });
    if (result) {
      console.log('Export successful');
    }
  });

  // Basic draggable resizer
  const resizer = document.getElementById('resizer');
  const leftSide = document.getElementById('editor-container');

  let x = 0;
  let leftWidth = 0;

  const mouseDownHandler = function(e) {
    x = e.clientX;
    const leftWidthStr = window.getComputedStyle(leftSide).width;
    leftWidth = parseInt(leftWidthStr, 10);

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function(e) {
    const dx = e.clientX - x;
    const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
    leftSide.style.width = `${newLeftWidth}%`;
  };

  const mouseUpHandler = function() {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  resizer.addEventListener('mousedown', mouseDownHandler);
});

async function requestRender() {
  if (!editor) return;
  const text = editor.getValue();
  const previewDiv = document.getElementById('preview-content');
  
  previewDiv.innerHTML = '<p class="placeholder-text">Rendering...</p>';
  
  try {
    const result = await window.electronAPI.renderPlantuml({ plantumlText: text, format: currentFormat });
    
    if (result.success) {
      if (currentFormat === 'svg') {
        previewDiv.innerHTML = result.data;
      } else {
        previewDiv.innerHTML = `<img src="${result.data}" alt="PlantUML Diagram" style="max-width: 100%; height: auto;" />`;
      }
    } else {
      previewDiv.innerHTML = `<pre style="color: red;">${result.error}</pre>`;
    }
  } catch (err) {
    previewDiv.innerHTML = `<pre style="color: red;">IPC Error: ${err.message}</pre>`;
  }
}
