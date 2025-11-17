import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, PieChart } from 'lucide-react';

/**
 * Componente de Dashboard principal
 * 
 * TODO: Implementar funcionalidades completas:
 * - Gráficos em tempo real com TradingView Lightweight Charts
 * - Integração com WebSocket para dados ao vivo
 * - Virtualização de listas para performance (react-window ou react-virtual)
 * - Memoização de componentes pesados (React.memo, useMemo)
 * - Painéis configuráveis e redimensionáveis
 */
const Dashboard = () => {
  // Dados mockados para demonstração
  const portfolioSummary = {
    totalValue: 125430.50,
    dayChange: 2345.67,
    dayChangePercentage: 1.91,
    totalPnL: 15430.50,
    totalPnLPercentage: 14.02,
  };

  const topPositions = [
    { symbol: 'PETR4', name: 'Petrobras PN', quantity: 500, avgPrice: 28.50, currentPrice: 30.25, pnl: 875.00, pnlPercentage: 6.14 },
    { symbol: 'VALE3', name: 'Vale ON', quantity: 300, avgPrice: 65.80, currentPrice: 68.90, pnl: 930.00, pnlPercentage: 4.71 },
    { symbol: 'ITUB4', name: 'Itaú Unibanco PN', quantity: 400, avgPrice: 25.20, currentPrice: 26.50, pnl: 520.00, pnlPercentage: 5.16 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Visão geral do seu portfólio</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 rounded-full bg-bull/10 text-bull text-sm font-medium">
                Mercado Aberto
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Resumo do Portfólio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Valor Total */}
          <div className="trading-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Valor Total</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              R$ {portfolioSummary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-bull mr-1" />
              <span className="text-bull font-medium">
                +R$ {portfolioSummary.dayChange.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-muted-foreground ml-1">
                ({portfolioSummary.dayChangePercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Lucro/Prejuízo Total */}
          <div className="trading-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Lucro/Prejuízo</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-bull">
              +R$ {portfolioSummary.totalPnL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-bull font-medium">
                +{portfolioSummary.totalPnLPercentage.toFixed(2)}%
              </span>
              <span className="text-muted-foreground ml-1">desde o início</span>
            </div>
          </div>

          {/* Posições Abertas */}
          <div className="trading-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Posições Abertas</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">8 ações, 4 FIIs</span>
            </div>
          </div>

          {/* Diversificação */}
          <div className="trading-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Diversificação</span>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">78%</div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">Índice de diversificação</span>
            </div>
          </div>
        </div>

        {/* Principais Posições */}
        <div className="trading-card mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Principais Posições</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ativo</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quantidade</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Preço Médio</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Preço Atual</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Lucro/Prejuízo</th>
                </tr>
              </thead>
              <tbody>
                {topPositions.map((position) => (
                  <tr key={position.symbol} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-foreground">{position.symbol}</div>
                        <div className="text-sm text-muted-foreground">{position.name}</div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-foreground">{position.quantity}</td>
                    <td className="text-right py-3 px-4 text-foreground">
                      R$ {position.avgPrice.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 text-foreground">
                      R$ {position.currentPrice.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className={position.pnl >= 0 ? 'text-bull' : 'text-bear'}>
                        <div className="font-medium">
                          {position.pnl >= 0 ? '+' : ''}R$ {position.pnl.toFixed(2)}
                        </div>
                        <div className="text-sm">
                          {position.pnl >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nota sobre Performance */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-2">⚡ Otimizações de Performance</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Este dashboard está preparado para implementar as seguintes técnicas de performance:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• <strong>Virtualização de listas</strong> com react-window para tabelas longas de ordens e posições</li>
            <li>• <strong>Memoização</strong> de componentes pesados com React.memo e useMemo</li>
            <li>• <strong>Debouncing</strong> de atualizações em tempo real para evitar re-renders excessivos</li>
            <li>• <strong>Code splitting</strong> e lazy loading de componentes de gráficos</li>
            <li>• <strong>Web Workers</strong> para cálculos de indicadores técnicos em background</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
