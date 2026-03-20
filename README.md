# PlantUML Offline Editor

![PlantUML Editor](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=mac&logoColor=white)
![PlantUML](https://img.shields.io/badge/PlantUML-FF79C6?style=for-the-badge&logo=plantuml&logoColor=white)

PlantUML Offline Editor es una herramienta minimalista y potente diseñada para diagramar con **PlantUML** de manera 100% desconectada (offline). Esta aplicación no requiere de servidores web externos, ya que incorpora su propia instancia del motor Java de PlantUML de forma autóctona.

## ✨ Características

- **100% Offline**: Renderizado local y privado. Cero dependencias web.
- **Monaco Editor Integrado**: Escribe tu código UML con la misma experiencia visual que ofrece VS Code, junto a una interfaz nativa en modo oscuro.
- **Navegación Pan & Zoom**: Explora diagramas gigantes cómodamente arrastrando el ratón sobre el lienzo oscuro y acercándote/alejándote fluidamente con la rueda del ratón.
- **Renderizado Inmediato**: Visualiza y compila los cambios de tu diagrama al instante.
- **Plantilla POO Definitiva (Dracula Theme)**: Al iniciar un nuevo proyecto vas a encontrarte con una plantilla avanzada (Cheat Sheet) demostrativa con la sintaxis de Programación Orientada a Objetos adaptada bajo un esquema de colores "estilo Dracula" de alto contraste.
- **Exportación**: Guarda tus diagramas generados en formatos `PNG` o `SVG` directamente a tu PC en alta calidad.
- **Motor Distribuible**: Todo el entorno se empaca en bloque gracias a incluir un JRE portátil de Java y `plantuml.jar`. No obligarás a tus usuarios a instalar *GraphViz* ni entornos de Java.

## 🚀 Instalación y Uso (Desarrollo)

Para probar la aplicación en modo desarrollo, simplemente corre:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/jdfesa/electron-plant.git
   ```
2. Instala los módulos de NodeJS:
   ```bash
   cd electron-plant
   npm install
   ```
3. Ejecuta la herramienta:
   ```bash
   npm start
   ```

## 📦 Empaquetado para Producción (Distribución)

La estructura utiliza `electron-builder` para agrupar los binarios instalables para el escritorio. El ejecutable incrusta la carpeta `/resources` haciendo el motor gráfico 100% autónomo.

Para compilar la aplicación final en entorno macOS (generará el instalador dentro de `dist/mac`):

```bash
npm run build
```

Para generar versiones de Windows o Linux (puede requerir emuladores Wine o ejecutarse preferentemente en sus sistemas nativos):
```bash
npm run build:win
npm run build:linux
```

## 🛠️ Apéndice de Tecnologías

- **[Electron](https://www.electronjs.org/)**: Framework principal de escritorio.
- **[PlantUML](https://plantuml.com/)**: Interfaz de dibujo compilada en JAR (limitando uso web y Graphviz con motor Smetana).
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)**: El núcleo ultra-versátil para edición enriquecida.
- **[Eclipse Temurin JRE](https://adoptium.net/)**: Entorno Headless.

---
*Software desarrollado por **José Sandoval***
