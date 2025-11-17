import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  positions: [],
  totalValue: 0,
  totalCost: 0,
  totalPnL: 0,
  totalPnLPercentage: 0,
  availableCash: 0,
  totalEquity: 0,
  dayChange: 0,
  dayChangePercentage: 0,
  isLoading: false,
  lastUpdated: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPositions: (state, action) => {
      state.positions = action.payload;
      state.lastUpdated = Date.now();
    },
    updatePosition: (state, action) => {
      const updatedPosition = action.payload;
      const index = state.positions.findIndex(
        (pos) => pos.symbol === updatedPosition.symbol
      );
      
      if (index !== -1) {
        state.positions[index] = { ...state.positions[index], ...updatedPosition };
      } else {
        state.positions.push(updatedPosition);
      }
      state.lastUpdated = Date.now();
    },
    removePosition: (state, action) => {
      const symbol = action.payload;
      state.positions = state.positions.filter((pos) => pos.symbol !== symbol);
      state.lastUpdated = Date.now();
    },
    setPortfolioSummary: (state, action) => {
      const {
        totalValue,
        totalCost,
        totalPnL,
        totalPnLPercentage,
        availableCash,
        totalEquity,
        dayChange,
        dayChangePercentage,
      } = action.payload;
      
      state.totalValue = totalValue;
      state.totalCost = totalCost;
      state.totalPnL = totalPnL;
      state.totalPnLPercentage = totalPnLPercentage;
      state.availableCash = availableCash;
      state.totalEquity = totalEquity;
      state.dayChange = dayChange;
      state.dayChangePercentage = dayChangePercentage;
      state.lastUpdated = Date.now();
    },
    setAvailableCash: (state, action) => {
      state.availableCash = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearPortfolio: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setPositions,
  updatePosition,
  removePosition,
  setPortfolioSummary,
  setAvailableCash,
  setLoading,
  clearPortfolio,
} = portfolioSlice.actions;

// Selectors
export const selectPositions = (state) => state.portfolio.positions;
export const selectPosition = (symbol) => (state) =>
  state.portfolio.positions.find((pos) => pos.symbol === symbol);
export const selectTotalValue = (state) => state.portfolio.totalValue;
export const selectTotalCost = (state) => state.portfolio.totalCost;
export const selectTotalPnL = (state) => state.portfolio.totalPnL;
export const selectTotalPnLPercentage = (state) => state.portfolio.totalPnLPercentage;
export const selectAvailableCash = (state) => state.portfolio.availableCash;
export const selectTotalEquity = (state) => state.portfolio.totalEquity;
export const selectDayChange = (state) => state.portfolio.dayChange;
export const selectDayChangePercentage = (state) => state.portfolio.dayChangePercentage;
export const selectPortfolioLoading = (state) => state.portfolio.isLoading;
export const selectLastUpdated = (state) => state.portfolio.lastUpdated;

export default portfolioSlice.reducer;
