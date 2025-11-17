/**
 * Utilitários para cálculos financeiros e de trading
 */

// Calcular variação percentual
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Calcular variação absoluta
export const calculateAbsoluteChange = (current, previous) => {
  return current - previous;
};

// Calcular preço médio
export const calculateAveragePrice = (prices) => {
  if (!prices || prices.length === 0) return 0;
  const sum = prices.reduce((acc, price) => acc + price, 0);
  return sum / prices.length;
};

// Calcular preço médio ponderado por volume
export const calculateVWAP = (candles) => {
  if (!candles || candles.length === 0) return 0;
  
  let totalVolume = 0;
  let totalValue = 0;
  
  candles.forEach((candle) => {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    totalValue += typicalPrice * candle.volume;
    totalVolume += candle.volume;
  });
  
  return totalVolume > 0 ? totalValue / totalVolume : 0;
};

// Calcular retorno total de um investimento
export const calculateReturn = (currentValue, initialValue, dividends = 0) => {
  if (!initialValue || initialValue === 0) return 0;
  return ((currentValue + dividends - initialValue) / initialValue) * 100;
};

// Calcular retorno anualizado
export const calculateAnnualizedReturn = (totalReturn, years) => {
  if (!years || years === 0) return 0;
  return (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100;
};

// Calcular volatilidade (desvio padrão)
export const calculateVolatility = (returns) => {
  if (!returns || returns.length === 0) return 0;
  
  const mean = returns.reduce((acc, val) => acc + val, 0) / returns.length;
  const squaredDiffs = returns.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / returns.length;
  
  return Math.sqrt(variance);
};

// Calcular Sharpe Ratio
export const calculateSharpeRatio = (portfolioReturn, riskFreeRate, volatility) => {
  if (!volatility || volatility === 0) return 0;
  return (portfolioReturn - riskFreeRate) / volatility;
};

// Calcular Beta (volatilidade relativa ao mercado)
export const calculateBeta = (assetReturns, marketReturns) => {
  if (!assetReturns || !marketReturns || assetReturns.length !== marketReturns.length) {
    return 1;
  }
  
  const n = assetReturns.length;
  const assetMean = assetReturns.reduce((acc, val) => acc + val, 0) / n;
  const marketMean = marketReturns.reduce((acc, val) => acc + val, 0) / n;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < n; i++) {
    covariance += (assetReturns[i] - assetMean) * (marketReturns[i] - marketMean);
    marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
  }
  
  covariance /= n;
  marketVariance /= n;
  
  return marketVariance > 0 ? covariance / marketVariance : 1;
};

// Calcular RSI (Relative Strength Index)
export const calculateRSI = (prices, period = 14) => {
  if (!prices || prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
};

// Calcular SMA (Simple Moving Average)
export const calculateSMA = (prices, period) => {
  if (!prices || prices.length < period) return null;
  
  const slice = prices.slice(-period);
  const sum = slice.reduce((acc, price) => acc + price, 0);
  return sum / period;
};

// Calcular EMA (Exponential Moving Average)
export const calculateEMA = (prices, period) => {
  if (!prices || prices.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
};

// Calcular MACD (Moving Average Convergence Divergence)
export const calculateMACD = (prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!prices || prices.length < slowPeriod) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macd = fastEMA - slowEMA;
  
  // Para simplificar, usamos uma aproximação para o sinal
  const signal = macd * 0.9; // Simplificação
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
};

// Calcular Bandas de Bollinger
export const calculateBollingerBands = (prices, period = 20, stdDev = 2) => {
  if (!prices || prices.length < period) {
    return { upper: 0, middle: 0, lower: 0 };
  }
  
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  
  const squaredDiffs = slice.map((price) => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + stdDev * standardDeviation,
    middle: sma,
    lower: sma - stdDev * standardDeviation,
  };
};

// Calcular valor total de uma posição
export const calculatePositionValue = (quantity, price) => {
  return quantity * price;
};

// Calcular lucro/prejuízo de uma posição
export const calculatePositionPnL = (quantity, entryPrice, currentPrice) => {
  return quantity * (currentPrice - entryPrice);
};

// Calcular lucro/prejuízo percentual
export const calculatePositionPnLPercentage = (entryPrice, currentPrice) => {
  return calculatePercentageChange(currentPrice, entryPrice);
};

// Calcular margem de lucro
export const calculateProfitMargin = (revenue, cost) => {
  if (!revenue || revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
};

// Calcular ROI (Return on Investment)
export const calculateROI = (gain, cost) => {
  if (!cost || cost === 0) return 0;
  return ((gain - cost) / cost) * 100;
};

// Calcular valor de stop loss
export const calculateStopLoss = (entryPrice, percentage) => {
  return entryPrice * (1 - percentage / 100);
};

// Calcular valor de take profit
export const calculateTakeProfit = (entryPrice, percentage) => {
  return entryPrice * (1 + percentage / 100);
};

// Calcular risco/retorno ratio
export const calculateRiskRewardRatio = (potentialProfit, potentialLoss) => {
  if (!potentialLoss || potentialLoss === 0) return 0;
  return potentialProfit / potentialLoss;
};

// Calcular tamanho da posição baseado em risco
export const calculatePositionSize = (accountBalance, riskPercentage, entryPrice, stopLoss) => {
  const riskAmount = accountBalance * (riskPercentage / 100);
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  
  if (riskPerShare === 0) return 0;
  
  return Math.floor(riskAmount / riskPerShare);
};

// Calcular diversificação do portfólio (Índice Herfindahl)
export const calculateDiversificationIndex = (positions) => {
  if (!positions || positions.length === 0) return 0;
  
  const totalValue = positions.reduce((acc, pos) => acc + pos.value, 0);
  
  if (totalValue === 0) return 0;
  
  const sumOfSquares = positions.reduce((acc, pos) => {
    const weight = pos.value / totalValue;
    return acc + Math.pow(weight, 2);
  }, 0);
  
  return (1 - sumOfSquares) * 100;
};

// Calcular alocação percentual
export const calculateAllocation = (positionValue, totalValue) => {
  if (!totalValue || totalValue === 0) return 0;
  return (positionValue / totalValue) * 100;
};

// Calcular dividend yield
export const calculateDividendYield = (annualDividend, currentPrice) => {
  if (!currentPrice || currentPrice === 0) return 0;
  return (annualDividend / currentPrice) * 100;
};

// Calcular P/L (Price to Earnings)
export const calculatePE = (price, earningsPerShare) => {
  if (!earningsPerShare || earningsPerShare === 0) return 0;
  return price / earningsPerShare;
};

// Calcular P/VP (Price to Book Value)
export const calculatePB = (price, bookValuePerShare) => {
  if (!bookValuePerShare || bookValuePerShare === 0) return 0;
  return price / bookValuePerShare;
};

export default {
  calculatePercentageChange,
  calculateAbsoluteChange,
  calculateAveragePrice,
  calculateVWAP,
  calculateReturn,
  calculateAnnualizedReturn,
  calculateVolatility,
  calculateSharpeRatio,
  calculateBeta,
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateMACD,
  calculateBollingerBands,
  calculatePositionValue,
  calculatePositionPnL,
  calculatePositionPnLPercentage,
  calculateProfitMargin,
  calculateROI,
  calculateStopLoss,
  calculateTakeProfit,
  calculateRiskRewardRatio,
  calculatePositionSize,
  calculateDiversificationIndex,
  calculateAllocation,
  calculateDividendYield,
  calculatePE,
  calculatePB,
};
