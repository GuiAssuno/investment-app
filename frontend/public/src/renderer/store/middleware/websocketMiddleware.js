import { updateQuote, updateOrderBook, setConnectionStatus } from '../slices/marketSlice';
import { updateOrder } from '../slices/ordersSlice';
import { updatePosition } from '../slices/portfolioSlice';

/**
 * Middleware para lidar com ações do WebSocket
 * Intercepta ações específicas e processa dados em tempo real
 */
const websocketMiddleware = (store) => {
  let socket = null;

  return (next) => (action) => {
    switch (action.type) {
      case 'websocket/connect': {
        if (socket !== null) {
          socket.close();
        }

        // Criar conexão WebSocket
        // socket = new WebSocket(action.payload.url);
        
        // Simulação de conexão
        store.dispatch(setConnectionStatus(true));
        
        // Configurar listeners
        // socket.onopen = () => {
        //   store.dispatch(setConnectionStatus(true));
        // };
        
        // socket.onclose = () => {
        //   store.dispatch(setConnectionStatus(false));
        // };
        
        // socket.onmessage = (event) => {
        //   const data = JSON.parse(event.data);
        //   handleWebSocketMessage(store, data);
        // };
        
        break;
      }

      case 'websocket/disconnect': {
        if (socket !== null) {
          socket.close();
          socket = null;
        }
        store.dispatch(setConnectionStatus(false));
        break;
      }

      case 'websocket/send': {
        if (socket !== null && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(action.payload));
        }
        break;
      }

      default:
        break;
    }

    return next(action);
  };
};

/**
 * Processar mensagens recebidas do WebSocket
 */
function handleWebSocketMessage(store, data) {
  const { type, payload } = data;

  switch (type) {
    case 'quote_update':
      store.dispatch(updateQuote({
        symbol: payload.symbol,
        data: payload,
      }));
      break;

    case 'orderbook_update':
      store.dispatch(updateOrderBook({
        symbol: payload.symbol,
        data: payload,
      }));
      break;

    case 'order_update':
      store.dispatch(updateOrder(payload));
      break;

    case 'position_update':
      store.dispatch(updatePosition(payload));
      break;

    default:
      console.warn('Tipo de mensagem WebSocket desconhecido:', type);
  }
}

export default websocketMiddleware;
