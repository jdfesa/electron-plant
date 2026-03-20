# Guía de Compilación Multiplataforma (Build Guide)

Esta guía documenta los pasos exactos para compilar **PlantUML Offline Editor** desde el código fuente para generar ejecutables nativos (`.exe`, `.dmg`, `.AppImage`) en Windows, macOS y Linux.

## ⚠️ El Concepto Clave: El Motor Java (JRE)

La característica principal de esta aplicación es que funciona **100% offline**. Para lograr esto de forma universal, incrusta un motor Java Headless (JRE) dentro de su ejecutable final. 

Dado que cada sistema operativo tiene una arquitectura de procesador empíricamente distinta, **no puedes compilar la aplicación para un sistema diferente manteniendo el motor Java de fábrica del repositorio**. 

Actualmente, el código de GitHub incluye dentro de la carpeta `resources/jre` el motor optimizado únicamente para **macOS Intel (x64)**. Si intentas ejecutar la herramienta de compilación (`electron-builder`) en Windows sin alterar esta carpeta, el ejecutable `.exe` nacerá con un Java de Mac en su interior y la aplicación se estrellará en las computadoras Windows de los usuarios finales al intentar renderizar diagramas.

Sigue los pasos a continuación, según tu sistema operativo de empaquetado, para reemplazar el JRE por el correcto antes de empaquetar o correr la app.

---

## 🪟 Compilar para Windows

1. **Instalar Requisitos Fundamentales:**
   Asegúrate de tener [Git](https://git-scm.com/) y [Node.js](https://nodejs.org/) instalados de manera global en tu sistema Windows.
2. **Clonar el proyecto:**
   ```bash
   git clone https://github.com/jdfesa/electron-plant.git
   cd electron-plant
   ```
3. **Instalar Node Modules:**
   ```bash
   npm install
   ```
4. **Reemplazar el motor Java (JRE) por el de Windows:**
   - Elimina la carpeta íntegra `resources/jre` (ya que le pertenece a Mac).
   - Descarga el contenedor **JRE 21 para Windows (x64)** desde el servidor oficial abierto de Eclipse Adoptium: [Descargar enlace directo JRE Windows .zip](https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jre/hotspot/normal/eclipse)
   - Descomprime el archivo `.zip` descargado.
   - Copia el archivo `java.exe` interno y todo el contenido extraído para incrustarlo bajo la misma estructura borrada, es decir, dentro en `resources/jre`. 
   *(Asegúrate de que la ruta final donde quede el inicializador lógico sea `resources/jre/bin/java.exe`).*
5. **Empaquetar la aplicación nativa:**
   ```bash
   npm run build:win
   ```
6. **Resultado:**
   Tu flamante instalador aislable `.exe` de PlantUML Editor estará esperando dentro de la carpeta `dist`.

---

## 🐧 Compilar para Linux

1. **Clonar e instalar dependencias iniciales:**
   ```bash
   git clone https://github.com/jdfesa/electron-plant.git
   cd electron-plant
   npm install
   ```
2. **Reemplazar el motor Java Linux (Adoptium):**
   - Nuevamente, se descarta y elimina por completo la carpeta actual `resources/jre`.
   - Descarga usando curl o desde el navegador el **JRE 21 para Linux (x64)** abierto: [Descargar enlace directo JRE Linux .tar.gz](https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jre/hotspot/normal/eclipse)
   - Extrae el `.tar.gz` y ubica el descompreso para poblar la nueva ubicación `resources/jre`.
   *(Misma validación: el binario final debe quedar legible en `resources/jre/bin/java`).*
3. **Empaquetar a nivel sistema operativo:**
   ```bash
   npm run build:linux
   ```
4. **Resultado de entrega de software:**
   Encontrarás el lanzamiento (normalmente en el standard universal `.AppImage` o `.deb`) dentro del directorio unificado de compilación `dist`.

---

## 🍎 Compilar para macOS

### Si realizas la compilación desde una Mac de arquitectura Intel (x64):
Como el repositorio maestro actualizamos y dejamos plantado adrede el entorno puro JRE de esta misma arquitectura para Intel, puedes ignorar todas las precauciones de sobre-escritura. La compilación es directa:
```bash
git clone https://github.com/jdfesa/electron-plant.git
cd electron-plant
npm install
npm run build
```

### Si usas procesador Silicon de nueva generación Apple (M1/M2/M3 - ARM64):
Tu sistema maneja arquitecturas RISC que colisionarían con el código compilado Intel del `resources/jre/` actual.
1. Haz la limpieza pertinente borrando la carpeta base `resources/jre`.
2. Adquiere el core arm re-ensamblado: **JRE 21 Mac aarch64**: [Descargar enlace directo JRE Mac ARM .tar.gz](https://api.adoptium.net/v3/binary/latest/21/ga/mac/aarch64/jre/hotspot/normal/eclipse).
3. Descomprime al igual que en Windows o Linux, llevando todo el contenido al corazón de tu clon en `resources/jre`. *(Revisa que la ruta maestra localice tu archivo a través de la carpeta particular oculta Mac en `resources/jre/Contents/Home/bin/java`)*.
4. Genera el empaquetado seguro base DMG Mac:
   ```bash
   npm run build
   ```
   
> **Nota para integraciones CI/CD continuas:** Para cualquier desarrollador que quiera implementar esto dentro de sus Workflows de automatización como *GitHub Actions*, lo óptimo es orquestar un Script (*Pre-build Step*) que borre la carpeta estática `jre`, descargue en cuestión de milisegundos (`wget` / `curl -L`) la terminal del JRE universal compatible con el Servidor Runner Virtual activo (Win, Lin, OSX), modifique nombres de los directorios obtenidos y entonces dé inicio de luz verde al script base original `npm run build`.
