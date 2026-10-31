const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('egehs', {
  desktop: true,
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: value => ipcRenderer.invoke('settings:save', value),
  generate: value => ipcRenderer.invoke('ai:generate', value),
  saveHtml: html => ipcRenderer.invoke('file:save-html', html)
});
