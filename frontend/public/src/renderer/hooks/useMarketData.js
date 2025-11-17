import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWebSocket } from './useWebSocket';
import { updateQuote, selectQuote } from '@/store/slices/marketSlice';

/**
 * Hook customizado para obter dados de mercado em tempo real
 * 
 * @param {string} symbol - Símbolo do ativo
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Dados do mercado e métodos
 */
export const useMarketData = (symbol, options = {}) => {
  const { autoSubscribe = true } = options;
  const dispatch = useDispatch();
  const { send, on, off, isConnected } = useWebSocket();
  const quote = useSelector(selectQuote(symbol));
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Inscrever-se para receber atualizações
  const subscribe = useCallback(() => {
    if (!symbol || !isConnected) return;

    send('subscribe', { channel: 'quotes', symbol });
    setIsSubscribed(true);
  }, [symbol, isConnected, send]);

  // Cancelar inscrição
  const unsubscribe = useCallback(() => {
    if (!symbol || !isConnected) return;

    send('unsubscribe', { channel: 'quotes', symbol });
    setIsSubscribed(false);
  }, [symbol, isConnected, send]);

  // Handler para atualizações de cotação
  useEffect(() => {
    const handleQuoteUpdate = (data) => {
      if (data.symbol === symbol) {
        dispatch(updateQuote({ symbol, data }));
      }
    };

    on('quote_update', handleQuoteUpdate);

    return () => {
      off('quote_update', handleQuoteUpdate);
    };
  }, [symbol, on, off, dispatch]);

  // Auto-inscrever ao montar
  useEffect(() => {
    if (autoSubscribe && symbol && isConnected) {
      subscribe();
    }

    return () => {
      if (autoSubscribe && isSubscribed) {
        unsubscribe();
      }
    };
  }, [autoSubscribe, symbol, isConnected, subscribe, unsubscribe, isSubscribed]);

  return {
    quote,
    subscribe,
    unsubscribe,
    isSubscribed,
    isConnected,
  };
};

export default useMarketData;
