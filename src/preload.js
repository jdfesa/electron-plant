const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  renderPlantuml: (data) => ipcRenderer.invoke('render-plantuml', data),
  exportDiagram: (data) => ipcRenderer.invoke('export-diagram', data)
});
