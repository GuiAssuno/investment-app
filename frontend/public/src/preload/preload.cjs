const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script para expor APIs seguras ao processo renderer
 * Este script roda em um contexto isolado e seguro
 */

// API segura exposta ao renderer
const electronAPI = {
  // Informações do sistema
  system: {
    getInfo: () => ipcRenderer.invoke('system:getInfo'),
  },

  // Controles da janela
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  // Armazenamento seguro
  storage: {
    get: (key) => ipcRenderer.invoke('storage:get', key),
    set: (key, value) => ipcRenderer.invoke('storage:set', key, value),
    delete: (key) => ipcRenderer.invoke('storage:delete', key),
  },

  // Notificações
  notification: {
    show: (options) => ipcRenderer.invoke('notification:show', options),
  },

  // Logs (apenas para desenvolvimento)
  log: {
    info: (message) => ipcRenderer.send('log:info', message),
    error: (message) => ipcRenderer.send('log:error', message),
  },

  // Listeners para eventos
  on: (channel, callback) => {
    const validChannels = [
      'window-maximized',
      'window-unmaximized',
      'app-update-available',
      'market-data-update'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  // Remover listeners
  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
};

// Expor API de forma segura
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Expor informações sobre o ambiente
contextBridge.exposeInMainWorld('appInfo', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron,
});

// Log de inicialização (apenas desenvolvimento)
//if (process.env.NODE_ENV === 'development') {
console.log('Preload script carregado com sucesso');
//}
