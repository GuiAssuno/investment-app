const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Conta de Investimento
 * Representa uma conta de trading/investimento de um usuário
 */
class Account extends Model {
  /**
   * Verifica se a conta está ativa
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Calcula saldo disponível para trading
   */
  getAvailableBalance() {
    return this.balance - this.blocked_balance;
  }

  /**
   * Retorna dados públicos da conta
   */
  toPublicJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      account_number: this.account_number,
      account_type: this.account_type,
      balance: this.balance,
      blocked_balance: this.blocked_balance,
      available_balance: this.getAvailableBalance(),
      total_invested: this.total_invested,
      total_profit_loss: this.total_profit_loss,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

Account.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    account_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    account_type: {
      type: DataTypes.ENUM('individual', 'joint', 'corporate', 'paper_trading'),
      defaultValue: 'individual',
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    blocked_balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total_invested: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false,
    },
    total_profit_loss: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'closed'),
      defaultValue: 'active',
      allowNull: false,
    },
    risk_profile: {
      type: DataTypes.ENUM('conservative', 'moderate', 'aggressive'),
      defaultValue: 'moderate',
      allowNull: true,
    },
    max_daily_loss: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Limite máximo de perda diária',
    },
    max_position_size: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Tamanho máximo de posição individual',
    },
    leverage_limit: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 1.00,
      allowNull: false,
      comment: 'Limite de alavancagem permitido',
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
    modelName: 'Account',
    tableName: 'accounts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['account_number'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['account_type'],
      },
    ],
  }
);

module.exports = Account;

