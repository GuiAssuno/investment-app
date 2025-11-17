import { createSlice } from '@reduxjs/toolkit';
import { ORDER_STATUS } from '@/utils/constants';

const initialState = {
  orders: [],
  openOrders: [],
  orderHistory: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.openOrders = action.payload.filter(
        (order) => order.status === ORDER_STATUS.PENDING || 
                   order.status === ORDER_STATUS.PARTIALLY_FILLED
      );
      state.orderHistory = action.payload.filter(
        (order) => order.status === ORDER_STATUS.FILLED ||
                   order.status === ORDER_STATUS.CANCELLED ||
                   order.status === ORDER_STATUS.REJECTED ||
                   order.status === ORDER_STATUS.EXPIRED
      );
      state.lastUpdated = Date.now();
    },
    addOrder: (state, action) => {
      const newOrder = action.payload;
      state.orders.unshift(newOrder);
      
      if (newOrder.status === ORDER_STATUS.PENDING || 
          newOrder.status === ORDER_STATUS.PARTIALLY_FILLED) {
        state.openOrders.unshift(newOrder);
      } else {
        state.orderHistory.unshift(newOrder);
      }
      state.lastUpdated = Date.now();
    },
    updateOrder: (state, action) => {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex((order) => order.id === updatedOrder.id);
      
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...updatedOrder };
        
        // Atualizar nas listas específicas
        const openIndex = state.openOrders.findIndex((order) => order.id === updatedOrder.id);
        const historyIndex = state.orderHistory.findIndex((order) => order.id === updatedOrder.id);
        
        // Remover das listas antigas
        if (openIndex !== -1) {
          state.openOrders.splice(openIndex, 1);
        }
        if (historyIndex !== -1) {
          state.orderHistory.splice(historyIndex, 1);
        }
        
        // Adicionar na lista correta
        const finalOrder = state.orders[index];
        if (finalOrder.status === ORDER_STATUS.PENDING || 
            finalOrder.status === ORDER_STATUS.PARTIALLY_FILLED) {
          state.openOrders.unshift(finalOrder);
        } else {
          state.orderHistory.unshift(finalOrder);
        }
      }
      state.lastUpdated = Date.now();
    },
    removeOrder: (state, action) => {
      const orderId = action.payload;
      state.orders = state.orders.filter((order) => order.id !== orderId);
      state.openOrders = state.openOrders.filter((order) => order.id !== orderId);
      state.orderHistory = state.orderHistory.filter((order) => order.id !== orderId);
      state.lastUpdated = Date.now();
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.openOrders = [];
      state.orderHistory = [];
      state.lastUpdated = null;
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  removeOrder,
  setLoading,
  setError,
  clearError,
  clearOrders,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectOpenOrders = (state) => state.orders.openOrders;
export const selectOrderHistory = (state) => state.orders.orderHistory;
export const selectOrder = (orderId) => (state) =>
  state.orders.orders.find((order) => order.id === orderId);
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrdersLastUpdated = (state) => state.orders.lastUpdated;

// Selectors específicos
export const selectOrdersBySymbol = (symbol) => (state) =>
  state.orders.orders.filter((order) => order.symbol === symbol);
export const selectOpenOrdersBySymbol = (symbol) => (state) =>
  state.orders.openOrders.filter((order) => order.symbol === symbol);

export default ordersSlice.reducer;
