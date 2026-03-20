const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handler for rendering PlantUML
ipcMain.handle('render-plantuml', async (event, { plantumlText, format }) => {
  return new Promise((resolve, reject) => {
    // Determine path to plantuml.jar
    const isPackaged = app.isPackaged;
    const resourcesPath = isPackaged ? process.resourcesPath : path.join(__dirname, '..', 'resources');
    const jarPath = path.join(resourcesPath, 'plantuml.jar');
    
    // Determine path to java executable
    let javaExecutable = 'java';
    const macBundledPath = path.join(resourcesPath, 'jre', 'Contents', 'Home', 'bin', 'java');
    const winLinBundledPath = path.join(resourcesPath, 'jre', 'bin', 'java');
    
    if (fs.existsSync(macBundledPath)) {
      javaExecutable = macBundledPath;
    } else if (fs.existsSync(winLinBundledPath)) {
      javaExecutable = winLinBundledPath;
    }

    const tformat = format === 'png' ? '-tpng' : '-tsvg';
    
    // Execute Java process
    const javaProcess = spawn(javaExecutable, ['-jar', jarPath, '-pipe', tformat]);
    
    let outputBuffer = Buffer.alloc(0);
    let errorOutput = '';

    javaProcess.stdout.on('data', (data) => {
      outputBuffer = Buffer.concat([outputBuffer, data]);
    });

    javaProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    javaProcess.on('close', (code) => {
      if (code === 0 && outputBuffer.length > 0) {
        if (format === 'svg') {
          resolve({ success: true, data: outputBuffer.toString('utf-8') });
        } else {
          resolve({ success: true, data: `data:image/png;base64,${outputBuffer.toString('base64')}` });
        }
      } else {
        resolve({ success: false, error: errorOutput || 'Unknown PlantUML rendering error' });
      }
    });

    // Write PlantUML source code to STDIN
    javaProcess.stdin.write(plantumlText);
    javaProcess.stdin.end();
  });
});

// IPC Handler for exporting diagram
ipcMain.handle('export-diagram', async (event, { bufferData, format }) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Diagram',
    defaultPath: `diagram.${format}`,
    filters: [
      { name: format === 'svg' ? 'SVG Image' : (format === 'png' ? 'PNG Image' : 'JPEG Image'), extensions: [format] }
    ]
  });

  if (filePath) {
    if (format === 'svg') {
      fs.writeFileSync(filePath, bufferData);
    } else {
      const base64Data = bufferData.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    }
    return true;
  }
  return false;
});
