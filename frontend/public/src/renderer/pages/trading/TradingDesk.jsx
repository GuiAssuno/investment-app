import React from 'react';

const TradingDesk = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">Mesa de Operações</h1>
      <div className="trading-card">
        <p className="text-muted-foreground">
          Página de trading em desenvolvimento. Aqui será implementado:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground ml-4">
          <li>• Gráficos de candlestick com TradingView Lightweight Charts</li>
          <li>• Book de ofertas em tempo real</li>
          <li>• Formulário de entrada de ordens</li>
          <li>• Histórico de trades</li>
          <li>• Indicadores técnicos</li>
        </ul>
      </div>
    </div>
  );
};

export default TradingDesk;
