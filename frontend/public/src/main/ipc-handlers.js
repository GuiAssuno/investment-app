// src/main/ipc-handlers.js (versão ESM)

// 🚨 CORREÇÃO 1: Substituir require('electron') por import
import { ipcMain, Notification } from 'electron'; 

/**
 * Handlers para comunicação IPC entre o processo principal e o renderer
 */

// Handler para obter informações do sistema
ipcMain.handle('system:getInfo', async () => {
  return {
    platform: process.platform,
    version: process.version,
    arch: process.arch,
  };
});

// Handler para minimizar janela
ipcMain.handle('window:minimize', async (event) => {
  const window = event.sender.getOwnerBrowserWindow();
  window.minimize();
});

// Handler para maximizar/restaurar janela
ipcMain.handle('window:maximize', async (event) => {
  const window = event.sender.getOwnerBrowserWindow();
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
  return window.isMaximized();
});

// Handler para fechar janela
ipcMain.handle('window:close', async (event) => {
  const window = event.sender.getOwnerBrowserWindow();
  window.close();
});

// Handler para verificar se a janela está maximizada
ipcMain.handle('window:isMaximized', async (event) => {
  const window = event.sender.getOwnerBrowserWindow();
  return window.isMaximized();
});

// Handler para armazenamento local seguro (exemplo)
ipcMain.handle('storage:get', async (event, key) => {
  // Implementar lógica de armazenamento seguro
  // Por exemplo, usando electron-store
  return null;
});

ipcMain.handle('storage:set', async (event, key, value) => {
  // Implementar lógica de armazenamento seguro
  return true;
});

ipcMain.handle('storage:delete', async (event, key) => {
  // Implementar lógica de remoção
  return true;
});

// Handler para notificações do sistema
ipcMain.handle('notification:show', async (event, options) => {
  // 🚨 CORREÇÃO 2: A 'Notification' já está importada acima.
  
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: options.title || 'Investment App',
      body: options.body || '',
      icon: options.icon,
    });
    
    notification.show();
    return true;
  }
  
  return false;
});

// Handler para logs (desenvolvimento)
ipcMain.on('log:info', (event, message) => {
  console.log('[Renderer]', message);
});

ipcMain.on('log:error', (event, message) => {
  console.error('[Renderer]', message);
});

// 🚨 CORREÇÃO 3: Remover module.exports
// Não precisamos exportar nada, pois o arquivo apenas registra handlers.
// O 'import' em main.js garante que este arquivo seja executado.