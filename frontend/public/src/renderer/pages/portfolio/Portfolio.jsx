import React from 'react';

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">Portfólio</h1>
      <div className="trading-card">
        <p className="text-muted-foreground">
          Página de portfólio em desenvolvimento. Aqui será implementado:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground ml-4">
          <li>• Tabela de posições com TanStack Table</li>
          <li>• Gráficos de alocação com Recharts</li>
          <li>• Análise de performance</li>
          <li>• Histórico de dividendos</li>
          <li>• Relatórios de imposto de renda</li>
        </ul>
      </div>
    </div>
  );
};

export default Portfolio;
