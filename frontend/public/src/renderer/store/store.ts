import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Importar slices
import authSlice from './slices/authSlice';
import marketSlice from './slices/marketSlice';
import portfolioSlice from './slices/portfolioSlice';
import ordersSlice from './slices/ordersSlice';

// Importar middleware
import websocketMiddleware from './middleware/websocketMiddleware';

// Importar APIs RTK Query
import { authApi } from '@/services/api/auth.api';
import { tradingApi } from '@/services/api/trading.api';
import { marketApi } from '@/services/api/market.api';
import { portfolioApi } from '@/services/api/portfolio.api';

export const store = configureStore({
  reducer: {
    // Slices
    auth: authSlice,
    market: marketSlice,
    portfolio: portfolioSlice,
    orders: ordersSlice,
    
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [tradingApi.reducerPath]: tradingApi.reducer,
    [marketApi.reducerPath]: marketApi.reducer,
    [portfolioApi.reducerPath]: portfolioApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(authApi.middleware)
      .concat(tradingApi.middleware)
      .concat(marketApi.middleware)
      .concat(portfolioApi.middleware)
      .concat(websocketMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners para RTK Query
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
