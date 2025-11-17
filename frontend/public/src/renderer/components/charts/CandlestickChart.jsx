import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

/**
 * Componente de gráfico de candlestick usando TradingView Lightweight Charts
 * 
 * @param {Array} data - Array de dados OHLCV
 * @param {Object} options - Opções de configuração do gráfico
 */
const CandlestickChart = ({ data = [], options = {}, height = 400 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Criar gráfico
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      ...options,
    });

    chartRef.current = chart;

    // Adicionar série de candlestick
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Definir dados
    if (data && data.length > 0) {
      candlestickSeries.setData(data);
    }

    // Ajustar para caber na tela
    chart.timeScale().fitContent();

    // Responsividade
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height, options]);

  // Atualizar dados quando mudarem
  useEffect(() => {
    if (candlestickSeriesRef.current && data && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height: `${height}px` }}
    />
  );
};

export default CandlestickChart;
