/**
 * Utilitários para formatação de dados financeiros e gerais
 */

// Formatação de moeda brasileira
export const formatCurrency = (value, options = {}) => {
  const {
    currency = 'BRL',
    locale = 'pt-BR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

// Formatação de percentual
export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'pt-BR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSign = false,
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '0,00%';
  }

  const formatted = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);

  if (showSign && value > 0) {
    return `+${formatted}`;
  }

  return formatted;
};

// Formatação de números grandes (K, M, B)
export const formatLargeNumber = (value, options = {}) => {
  const { locale = 'pt-BR', precision = 1 } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(precision)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(precision)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(precision)}K`;
  }

  return new Intl.NumberFormat(locale).format(value);
};

// Formatação de volume
export const formatVolume = (value) => {
  return formatLargeNumber(value, { precision: 0 });
};

// Formatação de data e hora
export const formatDateTime = (date, options = {}) => {
  const {
    locale = 'pt-BR',
    dateStyle = 'short',
    timeStyle = 'short',
  } = options;

  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle,
  }).format(dateObj);
};

// Formatação apenas de data
export const formatDate = (date, options = {}) => {
  const { locale = 'pt-BR', dateStyle = 'short' } = options;

  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
  }).format(dateObj);
};

// Formatação apenas de hora
export const formatTime = (date, options = {}) => {
  const { locale = 'pt-BR', timeStyle = 'short' } = options;

  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat(locale, {
    timeStyle,
  }).format(dateObj);
};

// Formatação de ticker/símbolo
export const formatTicker = (ticker) => {
  if (!ticker) return '';
  return ticker.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

// Formatação de variação de preço
export const formatPriceChange = (current, previous, options = {}) => {
  const { showPercentage = true, showSign = true } = options;

  if (!current || !previous) return { value: 0, percentage: 0, formatted: 'R$ 0,00' };

  const change = current - previous;
  const percentage = (change / previous) * 100;

  const formattedValue = formatCurrency(Math.abs(change));
  const formattedPercentage = formatPercentage(Math.abs(percentage));

  let formatted = formattedValue;
  if (showPercentage) {
    formatted += ` (${formattedPercentage})`;
  }

  if (showSign) {
    formatted = (change >= 0 ? '+' : '-') + formatted;
  }

  return {
    value: change,
    percentage,
    formatted,
    isPositive: change >= 0,
    isNegative: change < 0,
  };
};

// Formatação de número decimal
export const formatDecimal = (value, decimals = 2, locale = 'pt-BR') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Formatação de CNPJ
export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return cnpj;
  
  return numbers.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

// Formatação de CPF
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return cpf;
  
  return numbers.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    '$1.$2.$3-$4'
  );
};

// Truncar texto
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  formatVolume,
  formatDateTime,
  formatDate,
  formatTime,
  formatTicker,
  formatPriceChange,
  formatDecimal,
  formatCNPJ,
  formatCPF,
  truncateText,
};
