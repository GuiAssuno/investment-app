import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, Activity } from 'lucide-react';

/**
 * Componente de Painel de Análise
 * Exibe gráficos e tabelas de índices e análises de investimentos
 */
const AnalysisPanel = () => {
  const [selectedTab, setSelectedTab] = useState('indices');

  // Dados mockados para gráficos
  const indicesData = [
    { date: '10/01', ibov: 120000, sp500: 4500, nasdaq: 14000 },
    { date: '11/01', ibov: 121500, sp500: 4550, nasdaq: 14200 },
    { date: '12/01', ibov: 119800, sp500: 4480, nasdaq: 13900 },
    { date: '13/01', ibov: 122300, sp500: 4600, nasdaq: 14300 },
    { date: '14/01', ibov: 123100, sp500: 4650, nasdaq: 14500 },
  ];

  const portfolioData = [
    { month: 'Jan', rendimento: 2.5, meta: 3.0 },
    { month: 'Fev', rendimento: 3.2, meta: 3.0 },
    { month: 'Mar', rendimento: 2.8, meta: 3.0 },
    { month: 'Abr', rendimento: 4.1, meta: 3.0 },
    { month: 'Mai', rendimento: 3.5, meta: 3.0 },
    { month: 'Jun', rendimento: 3.8, meta: 3.0 },
  ];

  const topStocks = [
    { symbol: 'PETR4', name: 'Petrobras', price: 38.50, change: 2.5, value: 15420 },
    { symbol: 'VALE3', name: 'Vale', price: 72.30, change: 1.8, value: 12890 },
    { symbol: 'ITUB4', name: 'Itaú', price: 28.90, change: -0.5, value: 10250 },
    { symbol: 'BBDC4', name: 'Bradesco', price: 15.60, change: 0.8, value: 8730 },
    { symbol: 'ABEV3', name: 'Ambev', price: 13.20, change: -1.2, value: 7540 },
  ];

  const metrics = [
    { label: 'Rendimento Total', value: 'R$ 12.450,00', change: '+18.5%', positive: true },
    { label: 'Patrimônio', value: 'R$ 85.230,00', change: '+5.2%', positive: true },
    { label: 'Dividendos', value: 'R$ 1.850,00', change: '+12.3%', positive: true },
    { label: 'Volatilidade', value: '15.2%', change: '-2.1%', positive: true },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full flex flex-col">
      {/* Header com Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTab('indices')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selectedTab === 'indices'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-1" />
            Índices
          </button>
          <button
            onClick={() => setSelectedTab('portfolio')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selectedTab === 'portfolio'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <PieChartIcon className="w-4 h-4 inline mr-1" />
            Portfólio
          </button>
          <button
            onClick={() => setSelectedTab('stocks')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selectedTab === 'stocks'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-1" />
            Ações
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <p className={`text-xs font-semibold ${metric.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      {/* Conteúdo baseado na tab selecionada */}
      <div className="flex-1 overflow-hidden">
        {selectedTab === 'indices' && (
          <div className="h-full">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Principais Índices</h4>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={indicesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="ibov" stroke="#3B82F6" strokeWidth={2} name="IBOVESPA" />
                <Line type="monotone" dataKey="sp500" stroke="#10B981" strokeWidth={2} name="S&P 500" />
                <Line type="monotone" dataKey="nasdaq" stroke="#F59E0B" strokeWidth={2} name="NASDAQ" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedTab === 'portfolio' && (
          <div className="h-full">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Rendimento Mensal</h4>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="rendimento" fill="#3B82F6" name="Rendimento (%)" />
                <Bar dataKey="meta" fill="#10B981" name="Meta (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedTab === 'stocks' && (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Top Ações da Carteira</h4>
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-gray-700 dark:text-gray-300 font-semibold">Ativo</th>
                  <th className="text-right p-2 text-gray-700 dark:text-gray-300 font-semibold">Preço</th>
                  <th className="text-right p-2 text-gray-700 dark:text-gray-300 font-semibold">Var. %</th>
                  <th className="text-right p-2 text-gray-700 dark:text-gray-300 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {topStocks.map((stock, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</p>
                      </div>
                    </td>
                    <td className="text-right p-2 text-gray-900 dark:text-white font-medium">
                      R$ {stock.price.toFixed(2)}
                    </td>
                    <td className={`text-right p-2 font-semibold ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <div className="flex items-center justify-end">
                        {stock.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </div>
                    </td>
                    <td className="text-right p-2 text-gray-900 dark:text-white font-medium">
                      R$ {stock.value.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
      `}</style>
    </div>
  );
};

export default AnalysisPanel;

