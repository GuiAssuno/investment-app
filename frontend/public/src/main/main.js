import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url'; // 🚨 NOVO IMPORT

// 🚨 DEFINIÇÃO DE __dirname E __filename PARA AMBIENTE ESM 🚨
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// FIM DA DEFINIÇÃO
// Process.env é global no Electron Main Process e geralmente funciona, mas mantemos
// a importação para garantir que o resto do arquivo seja ESM puro.
// Em vez de usar const isDev = require('electron-is-dev'), usamos process.env
const isDev = process.env.NODE_ENV === 'development';

// 🚨 CORREÇÃO 1: Substituir require() por import
import './ipc-handlers.js'; // Note: Adicione a extensão .js para imports relativos no ESM

class WindowManager {
  constructor() {
    this.mainWindow = null;
  }

  createMainWindow() {
    // Criar a janela principal
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../preload/preload.cjs')
      },
      titleBarStyle: 'default',
      show: false, // Não mostrar até estar pronto
      icon: path.join(__dirname, '../../public/assets/icons/app-icon.png')
    });

    // Carregar a aplicação
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      // Abrir DevTools em desenvolvimento
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
    }

    // Mostrar janela quando estiver pronta
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      
      // Focar na janela
      if (isDev) {
        this.mainWindow.focus();
      }
    });

    // Emitir evento quando a janela for fechada
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Prevenir navegação externa
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      
      if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
        event.preventDefault();
      }
    });

    return this.mainWindow;
  }

  getMainWindow() {
    return this.mainWindow;
  }
}

const windowManager = new WindowManager();

// Evento quando o Electron terminou de inicializar
app.whenReady().then(() => {
  // 🚨 CORREÇÃO 2: Aplicar Permissões do Sandbox (Linux)
  // Recomendo executar os comandos 'sudo chown' e 'sudo chmod' no terminal (Passo 3)
  // OU adicionar o flag --no-sandbox no script 'electron:dev'

  windowManager.createMainWindow();

  app.on('activate', () => {
    // No macOS, recriar janela quando o ícone do dock for clicado
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createMainWindow();
    }
  });
});

// Sair quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  // No macOS, aplicações ficam ativas até que o usuário saia explicitamente
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Segurança: Prevenir criação de novas janelas
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    // Prevenir abertura de novas janelas
    event.preventDefault();
  });
});

// 🚨 CORREÇÃO 3: Substituir module.exports por export default
export default windowManager;

// Se o código ipc-handlers também for exportado, você pode fazer:
// export { windowManager };