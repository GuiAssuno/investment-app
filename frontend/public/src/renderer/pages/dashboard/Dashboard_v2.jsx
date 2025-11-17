import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import MarketIndicesChart from '../../components/charts/MarketIndicesChart';
import PortfolioChart from '../../components/charts/PortfolioChart';
import PerformanceChart from '../../components/charts/PerformanceChart';

const Dashboard = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 127845.32,
    dailyChange: 2845.67,
    dailyChangePercent: 2.28,
    positions: 12,
    totalInvested: 115000.00,
    totalReturn: 12845.32,
    returnPercent: 11.17
  });

  const [indices, setIndices] = useState([
    { name: 'IBOVESPA', value: 127845.32, change: 2.45, changePercent: 1.95 },
    { name: 'IFIX', value: 3245.67, change: -0.12, changePercent: -0.04 },
    { name: 'SMLL', value: 2987.54, change: 1.23, changePercent: 0.41 },
    { name: 'IDIV', value: 5432.18, change: 0.87, changePercent: 0.16 }
  ]);

  const [topPositions, setTopPositions] = useState([
    { symbol: 'PETR4', quantity: 500, avgPrice: 32.45, currentPrice: 38.42, total: 19210, gain: 2985, gainPercent: 18.4 },
    { symbol: 'VALE3', quantity: 300, avgPrice: 58.12, currentPrice: 62.15, total: 18645, gain: 1209, gainPercent: 6.9 },
    { symbol: 'ITUB4', quantity: 800, avgPrice: 26.87, currentPrice: 28.93, total: 23144, gain: 1648, gainPercent: 7.7 },
    { symbol: 'BBDC4', quantity: 1000, avgPrice: 14.23, currentPrice: 13.87, total: 13870, gain: -360, gainPercent: -2.5 }
  ]);

  // Simular atualização de preços
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioData(prev => {
        const randomChange = (Math.random() - 0.5) * 1000;
        const newTotal = prev.totalValue + randomChange;
        const newDaily = prev.dailyChange + randomChange;
        const newDailyPercent = (newDaily / (newTotal - newDaily)) * 100;

        return {
          ...prev,
          totalValue: newTotal,
          dailyChange: newDaily,
          dailyChangePercent: newDailyPercent
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard p-6 space-y-6">
      {/* Header com Resumo do Portfólio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Patrimônio Total</h3>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">
            R$ {portfolioData.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground">{portfolioData.positions} posições</p>
        </div>

        <div className="stat-card bg-gradient-to-br from-bull to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Começar a Investir</h3>
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <button className="w-full mt-4 bg-white text-bull font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors">
            Nova Operação
          </button>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Performance do Portfólio */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Performance do Portfólio</h3>
          <PerformanceChart />
        </div>

        {/* Gráfico de Alocação */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Alocação de Ativos</h3>
          <PortfolioChart />
        </div>
      </div>

      {/* Índices de Mercado */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Índices de Mercado</h3>
        <MarketIndicesChart indices={indices} />
      </div>

      {/* Top Posições */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Principais Posições</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ativo</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Qtd</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Preço Médio</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Preço Atual</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ganho/Perda</th>
              </tr>
            </thead>
            <tbody>
              {topPositions.map((position) => (
                <tr key={position.symbol} className="border-b border-border hover:bg-accent transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-bold text-foreground">{position.symbol}</span>
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">{position.quantity}</td>
                  <td className="text-right py-4 px-4 text-foreground">
                    R$ {position.avgPrice.toFixed(2)}
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">
                    R$ {position.currentPrice.toFixed(2)}
                  </td>
                  <td className="text-right py-4 px-4 font-medium text-foreground">
                    R$ {position.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`text-right py-4 px-4 font-bold ${
                    position.gain >= 0 ? 'text-bull' : 'text-bear'
                  }`}>
                    {position.gain >= 0 ? '+' : ''}R$ {position.gain.toFixed(2)}
                    <span className="text-sm ml-2">
                      ({position.gainPercent >= 0 ? '+' : ''}{position.gainPercent.toFixed(2)}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;foreground mb-1">
            R$ {portfolioData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            portfolioData.dailyChange >= 0 ? 'text-bull' : 'text-bear'
          }`}>
            {portfolioData.dailyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>
              {portfolioData.dailyChange >= 0 ? '+' : ''}
              R$ {Math.abs(portfolioData.dailyChange).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span>({portfolioData.dailyChangePercent >= 0 ? '+' : ''}{portfolioData.dailyChangePercent.toFixed(2)}%)</span>
          </div>
        </div>

        <div className="stat-card bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Retorno Total</h3>
            <Activity className="w-5 h-5 text-bull" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">
            R$ {portfolioData.totalReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-sm font-medium text-bull">
            <TrendingUp className="w-4 h-4" />
            <span>+{portfolioData.returnPercent.toFixed(2)}%</span>
          </div>
        </div>

        <div className="stat-card bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Investido</h3>
            <PieChartIcon className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-