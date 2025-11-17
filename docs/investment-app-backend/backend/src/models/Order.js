const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Ordem
 * Representa uma ordem de compra ou venda de ativos
 */
class Order extends Model {
  /**
   * Verifica se a ordem está ativa
   */
  isActive() {
    return ['pending', 'partially_filled'].includes(this.status);
  }

  /**
   * Verifica se a ordem foi executada completamente
   */
  isFilled() {
    return this.status === 'filled';
  }

  /**
   * Verifica se a ordem foi cancelada
   */
  isCancelled() {
    return this.status === 'cancelled';
  }

  /**
   * Calcula quantidade restante
   */
  getRemainingQuantity() {
    return this.quantity - (this.filled_quantity || 0);
  }

  /**
   * Calcula preço médio de execução
   */
  getAveragePrice() {
    if (!this.filled_quantity || this.filled_quantity === 0) {
      return 0;
    }
    return this.total_executed_value / this.filled_quantity;
  }

  /**
   * Retorna dados públicos da ordem
   */
  toPublicJSON() {
    return {
      id: this.id,
      account_id: this.account_id,
      symbol: this.symbol,
      side: this.side,
      type: this.type,
      quantity: this.quantity,
      price: this.price,
      stop_price: this.stop_price,
      status: this.status,
      filled_quantity: this.filled_quantity,
      remaining_quantity: this.getRemainingQuantity(),
      average_price: this.getAveragePrice(),
      total_executed_value: this.total_executed_value,
      fees: this.fees,
      time_in_force: this.time_in_force,
      created_at: this.created_at,
      updated_at: this.updated_at,
      executed_at: this.executed_at,
    };
  }
}

Order.init(
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
    side: {
      type: DataTypes.ENUM('buy', 'sell'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('market', 'limit', 'stop', 'stop_limit'),
      allowNull: false,
      defaultValue: 'market',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Preço limite (para ordens limit e stop_limit)',
    },
    stop_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Preço de disparo (para ordens stop e stop_limit)',
    },
    status: {
      type: DataTypes.ENUM('pending', 'partially_filled', 'filled', 'cancelled', 'rejected', 'expired'),
      defaultValue: 'pending',
      allowNull: false,
    },
    filled_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    total_executed_value: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false,
    },
    fees: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false,
    },
    time_in_force: {
      type: DataTypes.ENUM('day', 'gtc', 'ioc', 'fok'),
      defaultValue: 'day',
      allowNull: false,
      comment: 'GTC=Good Till Cancelled, IOC=Immediate Or Cancel, FOK=Fill Or Kill',
    },
    external_order_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ID da ordem na B3/PUMA',
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    executed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['account_id'],
      },
      {
        fields: ['symbol'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['side'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['account_id', 'status'],
      },
      {
        fields: ['external_order_id'],
      },
    ],
  }
);

module.exports = Order;

