import React from 'react';
import { cn } from '@/utils/cn';
import { formatCurrency, formatLargeNumber } from '@/utils/formatters';

/**
 * Componente de Book de Ofertas (Order Book)
 * Exibe ordens de compra e venda em tempo real
 * 
 * @param {Object} data - Dados do order book { bids: [], asks: [] }
 * @param {number} maxDepth - Profundidade máxima do book
 */
const OrderBook = ({ data = { bids: [], asks: [] }, maxDepth = 10 }) => {
  const { bids = [], asks = [] } = data;

  // Limitar profundidade
  const displayBids = bids.slice(0, maxDepth);
  const displayAsks = asks.slice(0, maxDepth).reverse();

  // Calcular volume total para barras de progresso
  const maxBidVolume = Math.max(...displayBids.map(b => b.volume || 0), 1);
  const maxAskVolume = Math.max(...displayAsks.map(a => a.volume || 0), 1);

  return (
    <div className="trading-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Book de Ofertas</h3>
      
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
          <div className="text-left">Preço</div>
          <div className="text-right">Quantidade</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Vendas) - em ordem decrescente */}
        <div className="space-y-1">
          {displayAsks.length > 0 ? (
            displayAsks.map((ask, index) => (
              <div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 gap-2 text-sm py-1 px-2 rounded hover:bg-bear/5 transition-colors"
              >
                {/* Barra de volume */}
                <div
                  className="absolute inset-0 bg-bear/10 rounded"
                  style={{
                    width: `${(ask.volume / maxAskVolume) * 100}%`,
                    right: 0,
                    left: 'auto',
                  }}
                />
                
                <div className="relative text-bear font-medium">
                  {formatCurrency(ask.price)}
                </div>
                <div className="relative text-right text-foreground">
                  {formatLargeNumber(ask.quantity)}
                </div>
                <div className="relative text-right text-muted-foreground">
                  {formatLargeNumber(ask.volume)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-sm py-4">
              Sem ordens de venda
            </div>
          )}
        </div>

        {/* Spread */}
        {bids.length > 0 && asks.length > 0 && (
          <div className="py-2 px-2 bg-muted/30 rounded text-center">
            <div className="text-xs text-muted-foreground">Spread</div>
            <div className="text-sm font-medium text-foreground">
              {formatCurrency(asks[0]?.price - bids[0]?.price)}
            </div>
          </div>
        )}

        {/* Bids (Compras) - em ordem decrescente */}
        <div className="space-y-1">
          {displayBids.length > 0 ? (
            displayBids.map((bid, index) => (
              <div
                key={`bid-${index}`}
                className="relative grid grid-cols-3 gap-2 text-sm py-1 px-2 rounded hover:bg-bull/5 transition-colors"
              >
                {/* Barra de volume */}
                <div
                  className="absolute inset-0 bg-bull/10 rounded"
                  style={{
                    width: `${(bid.volume / maxBidVolume) * 100}%`,
                    right: 0,
                    left: 'auto',
                  }}
                />
                
                <div className="relative text-bull font-medium">
                  {formatCurrency(bid.price)}
                </div>
                <div className="relative text-right text-foreground">
                  {formatLargeNumber(bid.quantity)}
                </div>
                <div className="relative text-right text-muted-foreground">
                  {formatLargeNumber(bid.volume)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-sm py-4">
              Sem ordens de compra
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
