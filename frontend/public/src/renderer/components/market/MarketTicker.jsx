import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useMarketData } from '../../hooks/useMarketData';
import { selectQuote } from '../../store/slices/marketSlice'; // Importe o seletor


// 1. Crie um componente filho para lidar com UM símbolo
const TickerItem = ({ symbol }) => {
  // O hook agora é chamado aqui, para um único símbolo.
  // Ele vai se encarregar de se inscrever para receber os dados via WebSocket.
  useMarketData(symbol); 
  
  // E aqui nós lemos os dados atualizados diretamente do Redux.
  const quote = useSelector(selectQuote(symbol));

  if (!quote) {
    return null; // ou um placeholder de carregamento
  }

  const isPositive = quote.regularMarketChangePercent >= 0;
  const changeColor = isPositive ? 'text-green-300' : 'text-red-300';

  return (
    <div className="ticker-item inline-flex items-center mx-6 whitespace-nowrap">
      <span className="font-bold text-sm mr-2">{quote.symbol}</span>
      <span className="text-sm mr-2">
        R$ {quote.regularMarketPrice?.toFixed(2) || '0.00'}
      </span>
      <span className={`flex items-center text-xs font-semibold ${changeColor}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {isPositive ? '+' : ''}
        {quote.regularMarketChangePercent?.toFixed(2) || '0.00'}%
      </span>
    </div>
  );
};

/**
 * Componente de barra de cotações animada
 * Exibe cotações em tempo real com animação de rolagem
 */

/*const MarketTicker = () => {
  const { quotes, loading } = useMarketData(['IBOV', 'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'B3SA3', 'MGLU3']);
  const [tickerItems, setTickerItems] = useState([]);

  useEffect(() => {
    if (quotes && quotes.length > 0) {
      // Duplicar itens para criar efeito de loop infinito
      setTickerItems([...quotes, ...quotes]);
    }
  }, [quotes]);

  if (loading || tickerItems.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white py-2 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="animate-pulse">Carregando cotações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white py-2 overflow-hidden relative">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {tickerItems.map((quote, index) => {
            const isPositive = quote.regularMarketChangePercent >= 0;
            const changeColor = isPositive ? 'text-green-300' : 'text-red-300';
            
            return (
              <div
                key={`${quote.symbol}-${index}`}
                className="ticker-item inline-flex items-center mx-6 whitespace-nowrap"
              >
                <span className="font-bold text-sm mr-2">{quote.symbol}</span>
                <span className="text-sm mr-2">
                  R$ {quote.regularMarketPrice?.toFixed(2) || '0.00'}
                </span>
                <span className={`flex items-center text-xs font-semibold ${changeColor}`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {isPositive ? '+' : ''}
                  {quote.regularMarketChangePercent?.toFixed(2) || '0.00'}%
                </span>
              </div>
            );
          })}
        </div>
      </div>*/
      // 2. O componente principal agora apenas gerencia a lista de símbolos e a animação
const MarketTicker = () => {
  const symbols = ['IBOV', 'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'B3SA3'];
  // Duplicamos a lista para o efeito de rolagem infinita
  const duplicatedSymbols = [...symbols, ...symbols];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white py-2 overflow-hidden relative">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {duplicatedSymbols.map((symbol, index) => (
            <TickerItem key={`${symbol}-${index}`} symbol={symbol} />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
        }
        
        .ticker-content {
          display: inline-flex;
          animation: ticker 30s linear infinite;
        }
        
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MarketTicker;

