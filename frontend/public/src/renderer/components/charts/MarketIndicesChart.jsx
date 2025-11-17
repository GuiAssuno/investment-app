import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketIndicesChart = ({ indices }) => {
  const [chartData, setChartData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('IBOVESPA');

  useEffect(() => {
    // Gerar dados históricos simulados para o índice selecionado
    const generateHistoricalData = () => {
      const data = [];
      const baseValue = indices.find(i => i.name === selectedIndex)?.value || 100000;
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const randomVariation = (Math.random() - 0.5) * 2000;
        const value = baseValue + randomVariation * (30 - i);
        
        data.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          value: value
        });
      }
      
      return data;
    };

    setChartData(generateHistoricalData());
  }, [selectedIndex, indices]);

  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="space-y-4">
      {/* Seletor de Índices */}
      <div className="flex gap-2 flex-wrap">
        {indices.map((index) => {
          const isSelected = index.name === selectedIndex;
          const isPositive = index.change >= 0;
          
          return (
            <button
              key={index.name}
              onClick={() => setSelectedIndex(index.name)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent hover:bg-accent/80 text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{index.name}</span>
                <span className={`text-sm font-medium ${isPositive ? 'text-bull' : 'text-bear'}`}>
                  {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm mt-1">
                {index.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Gráfico de Linha */}
      <div className="relative h-64 bg-accent/20 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          {/* Grid Lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`grid-${i}`}
              x1="0"
              y1={i * 50}
              x2="800"
              y2={i * 50}
              stroke="currentColor"
              strokeOpacity="0.1"
              className="text-muted-foreground"
            />
          ))}

          {/* Área preenchida */}
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Path da área */}
          <path
            d={`
              M 0 200
              ${chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 800;
                const y = 200 - ((d.value - minValue) / range) * 180;
                return `L ${x} ${y}`;
              }).join(' ')}
              L 800 200
              Z
            `}
            fill="url(#chartGradient)"
          />

          {/* Linha do gráfico */}
          <path
            d={`
              M ${chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 800;
                const y = 200 - ((d.value - minValue) / range) * 180;
                return `${x},${y}`;
              }).join(' L ')}
            `}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2"
            className="drop-shadow-lg"
          />

          {/* Pontos */}
          {chartData.map((d, i) => {
            if (i % 5 !== 0) return null;
            
            const x = (i / (chartData.length - 1)) * 800;
            const y = 200 - ((d.value - minValue) / range) * 180;
            
            return (
              <circle
                key={`point-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="rgb(34, 197, 94)"
                className="drop-shadow-md"
              />
            );
          })}
        </svg>

        {/* Labels do eixo X */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {chartData.filter((_, i) => i % 6 === 0).map((d, i) => (
            <span key={i}>{d.date}</span>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Mínimo (30d)</p>
          <p className="text-lg font-bold text-foreground">
            {minValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Atual</p>
          <p className="text-lg font-bold text-foreground">
            {indices.find(i => i.name === selectedIndex)?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Máximo (30d)</p>
          <p className="text-lg font-bold text-foreground">
            {maxValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketIndicesChart;