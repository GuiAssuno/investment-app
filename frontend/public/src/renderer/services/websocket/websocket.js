import { io } from 'socket.io-client';
import { WEBSOCKET_CONFIG, API_CONFIG } from '@/utils/constants';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.listeners = new Map();
    this.heartbeatInterval = null;
  }

  /**
   * Conectar ao servidor WebSocket
   */
  connect(token) {
    if (this.socket && this.isConnected) {
      console.warn('WebSocket já está conectado');
      return;
    }

    const wsUrl = API_CONFIG.BASE_URL.replace(/^http/, 'ws');

    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: WEBSOCKET_CONFIG.RECONNECT_INTERVAL,
      reconnectionAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
    });

    this.setupEventHandlers();
  }

  /**
   * Configurar event handlers
   */
  setupEventHandlers() {
    if (!this.socket) return;

    // Conectado
    this.socket.on('connect', () => {
      console.log('[WebSocket] Conectado');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connection', { status: 'connected' });
    });

    // Desconectado
    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Desconectado:', reason);
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('connection', { status: 'disconnected', reason });
    });

    // Erro de conexão
    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Erro de conexão:', error);
      this.reconnectAttempts++;
      this.emit('error', { type: 'connection', error });
    });

    // Tentativa de reconexão
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`[WebSocket] Tentativa de reconexão ${attempt}`);
      this.emit('reconnecting', { attempt });
    });

    // Reconectado
    this.socket.on('reconnect', (attempt) => {
      console.log(`[WebSocket] Reconectado após ${attempt} tentativas`);
      this.emit('reconnected', { attempt });
    });

    // Falha na reconexão
    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Falha na reconexão');
      this.emit('reconnect_failed', {});
    });

    // Pong (resposta ao heartbeat)
    this.socket.on('pong', () => {
      // Heartbeat recebido
    });
  }

  /**
   * Desconectar do servidor
   */
  disconnect() {
    if (this.socket) {
      this.stopHeartbeat();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Enviar mensagem
   */
  send(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn('[WebSocket] Não conectado. Mensagem não enviada.');
      return false;
    }

    this.socket.emit(event, data);
    return true;
  }

  /**
   * Registrar listener para um evento
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remover listener de um evento
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      
      if (index > -1) {
        callbacks.splice(index, 1);
      }

      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Emitir evento interno
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Erro ao executar callback para ${event}:`, error);
        }
      });
    }
  }

  /**
   * Iniciar heartbeat
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('ping');
      }
    }, WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * Parar heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Verificar se está conectado
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Exportar instância singleton
const wsClient = new WebSocketClient();
export default wsClient;
