const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('egehs', {
  desktop: true,
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: value => ipcRenderer.invoke('settings:save', value),
  generate: value => ipcRenderer.invoke('ai:generate', value),
  saveHtml: html => ipcRenderer.invoke('file:save-html', html),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateAvailable: callback => ipcRenderer.on('update:available', (_event, value) => callback(value)),
  onUpdateProgress: callback => ipcRenderer.on('update:progress', (_event, value) => callback(value)),
  onUpdateDownloaded: callback => ipcRenderer.on('update:downloaded', (_event, value) => callback(value)),
  onUpdateError: callback => ipcRenderer.on('update:error', (_event, value) => callback(value))
});
