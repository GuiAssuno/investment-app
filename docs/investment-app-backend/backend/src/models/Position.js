const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Posição
 * Representa uma posição em um ativo no portfólio
 */
class Position extends Model {
  /**
   * Calcula valor total da posição
   */
  getTotalValue(currentPrice) {
    return this.quantity * currentPrice;
  }

  /**
   * Calcula lucro/prejuízo
   */
  getProfitLoss(currentPrice) {
    const currentValue = this.getTotalValue(currentPrice);
    const costBasis = this.quantity * this.average_price;
    return currentValue - costBasis;
  }

  /**
   * Calcula percentual de lucro/prejuízo
   */
  getProfitLossPercent(currentPrice) {
    const costBasis = this.quantity * this.average_price;
    if (costBasis === 0) return 0;
    return ((this.getTotalValue(currentPrice) - costBasis) / costBasis) * 100;
  }

  /**
   * Retorna dados públicos da posição
   */
  toPublicJSON(currentPrice = null) {
    const data = {
      id: this.id,
      account_id: this.account_id,
      symbol: this.symbol,
      quantity: this.quantity,
      average_price: parseFloat(this.average_price),
      total_cost: parseFloat(this.total_cost),
      realized_pnl: parseFloat(this.realized_pnl),
      created_at: this.created_at,
      updated_at: this.updated_at,
    };

    if (currentPrice) {
      data.current_price = currentPrice;
      data.total_value = this.getTotalValue(currentPrice);
      data.unrealized_pnl = this.getProfitLoss(currentPrice);
      data.unrealized_pnl_percent = this.getProfitLossPercent(currentPrice);
    }

    return data;
  }
}

Position.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    symbol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Código do ativo (ex: PETR4, VALE3)',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    average_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Preço médio de aquisição',
    },
    total_cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Custo total (incluindo taxas)',
    },
    realized_pnl: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false,
      comment: 'Lucro/Prejuízo realizado (vendas)',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Position',
    tableName: 'positions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['account_id', 'symbol'],
      },
      {
        fields: ['account_id'],
      },
      {
        fields: ['symbol'],
      },
    ],
  }
);

module.exports = Position;

