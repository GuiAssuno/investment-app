import { useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import wsClient from '@/services/websocket/websocket';
import { selectAuthToken } from '@/store/slices/authSlice';

/**
 * Hook customizado para gerenciar conexão WebSocket
 * 
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.autoConnect - Conectar automaticamente ao montar
 * @returns {Object} - Métodos e estado do WebSocket
 */
export const useWebSocket = (options = {}) => {
  const { autoConnect = true } = options;
  const token = useSelector(selectAuthToken);
  const isConnectedRef = useRef(false);

  // Conectar ao WebSocket
  const connect = useCallback(() => {
    if (!token) {
      console.warn('[useWebSocket] Token não disponível');
      return;
    }

    if (isConnectedRef.current) {
      console.warn('[useWebSocket] Já conectado');
      return;
    }

    wsClient.connect(token);
    isConnectedRef.current = true;
  }, [token]);

  // Desconectar do WebSocket
  const disconnect = useCallback(() => {
    wsClient.disconnect();
    isConnectedRef.current = false;
  }, []);

  // Enviar mensagem
  const send = useCallback((event, data) => {
    return wsClient.send(event, data);
  }, []);

  // Registrar listener
  const on = useCallback((event, callback) => {
    wsClient.on(event, callback);
  }, []);

  // Remover listener
  const off = useCallback((event, callback) => {
    wsClient.off(event, callback);
  }, []);

  // Obter status de conexão
  const getConnectionStatus = useCallback(() => {
    return wsClient.getConnectionStatus();
  }, []);

  // Auto-conectar ao montar
  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    // Cleanup ao desmontar
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, token, connect, disconnect]);

  return {
    connect,
    disconnect,
    send,
    on,
    off,
    isConnected: getConnectionStatus(),
  };
};

export default useWebSocket;
