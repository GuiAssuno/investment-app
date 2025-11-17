import { createSlice } from '@reduxjs/toolkit';
import { MARKET_STATUS } from '@/utils/constants';

const initialState = {
  status: MARKET_STATUS.CLOSED,
  quotes: {},
  orderBook: {},
  watchlist: [],
  selectedSymbol: null,
  timeframe: '1D',
  interval: '1m',
  isConnected: false,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setMarketStatus: (state, action) => {
      state.status = action.payload;
    },
    updateQuote: (state, action) => {
      const { symbol, data } = action.payload;
      state.quotes[symbol] = {
        ...state.quotes[symbol],
        ...data,
        timestamp: Date.now(),
      };
    },
    updateOrderBook: (state, action) => {
      const { symbol, data } = action.payload;
      state.orderBook[symbol] = data;
    },
    setWatchlist: (state, action) => {
      state.watchlist = action.payload;
    },
    addToWatchlist: (state, action) => {
      const symbol = action.payload;
      if (!state.watchlist.includes(symbol)) {
        state.watchlist.push(symbol);
      }
    },
    removeFromWatchlist: (state, action) => {
      const symbol = action.payload;
      state.watchlist = state.watchlist.filter((s) => s !== symbol);
    },
    setSelectedSymbol: (state, action) => {
      state.selectedSymbol = action.payload;
    },
    setTimeframe: (state, action) => {
      state.timeframe = action.payload;
    },
    setInterval: (state, action) => {
      state.interval = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    clearMarketData: (state) => {
      state.quotes = {};
      state.orderBook = {};
    },
  },
});

export const {
  setMarketStatus,
  updateQuote,
  updateOrderBook,
  setWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  setSelectedSymbol,
  setTimeframe,
  setInterval,
  setConnectionStatus,
  clearMarketData,
} = marketSlice.actions;

// Selectors
export const selectMarketStatus = (state) => state.market.status;
export const selectQuotes = (state) => state.market.quotes;
export const selectQuote = (symbol) => (state) => state.market.quotes[symbol];
export const selectOrderBook = (symbol) => (state) => state.market.orderBook[symbol];
export const selectWatchlist = (state) => state.market.watchlist;
export const selectSelectedSymbol = (state) => state.market.selectedSymbol;
export const selectTimeframe = (state) => state.market.timeframe;
export const selectInterval = (state) => state.market.interval;
export const selectIsConnected = (state) => state.market.isConnected;

export default marketSlice.reducer;
