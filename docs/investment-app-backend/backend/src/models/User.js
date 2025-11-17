const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Usuário
 * Representa um usuário do sistema com autenticação e dados pessoais
 */
class User extends Model {
  /**
   * Verifica se o usuário tem KYC aprovado
   */
  hasApprovedKYC() {
    return this.kyc_status === 'approved';
  }

  /**
   * Verifica se o usuário tem 2FA habilitado
   */
  has2FAEnabled() {
    return this.two_factor_enabled;
  }

  /**
   * Retorna dados públicos do usuário (sem informações sensíveis)
   */
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      full_name: this.full_name,
      cpf: this.cpf,
      phone: this.phone,
      kyc_status: this.kyc_status,
      account_status: this.account_status,
      two_factor_enabled: this.two_factor_enabled,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true,
      validate: {
        is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    kyc_status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    kyc_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    account_status: {
      type: DataTypes.ENUM('active', 'suspended', 'closed'),
      defaultValue: 'active',
      allowNull: false,
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    two_factor_secret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_verification_token: {
      type: DataTypes.STRING(255),
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['cpf'],
      },
      {
        fields: ['kyc_status'],
      },
      {
        fields: ['account_status'],
      },
    ],
  }
);

module.exports = User;

