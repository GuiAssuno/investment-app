const crypto = require('crypto');
const bcrypt = require('bcrypt');
const config = require('../config/environment');

/**
 * Utilitários de criptografia e hashing
 */

/**
 * Gera hash de senha usando bcrypt
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error(`Erro ao gerar hash de senha: ${error.message}`);
  }
};

/**
 * Compara senha com hash
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash armazenado
 * @returns {Promise<boolean>} True se a senha corresponde
 */
const comparePassword = async (password, hash) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error(`Erro ao comparar senha: ${error.message}`);
  }
};

/**
 * Gera token aleatório
 * @param {number} length - Comprimento do token em bytes
 * @returns {string} Token hexadecimal
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Gera UUID v4
 * @returns {string} UUID
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Criptografa dados usando AES-256-GCM
 * @param {string} text - Texto a ser criptografado
 * @param {string} key - Chave de criptografia (32 bytes)
 * @returns {Object} Objeto com texto criptografado, IV e auth tag
 */
const encrypt = (text, key = config.security.sessionSecret) => {
  try {
    // Garantir que a chave tenha 32 bytes
    const cryptoKey = crypto.createHash('sha256').update(key).digest();
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', cryptoKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  } catch (error) {
    throw new Error(`Erro ao criptografar: ${error.message}`);
  }
};

/**
 * Descriptografa dados usando AES-256-GCM
 * @param {Object} encryptedData - Objeto com encrypted, iv e authTag
 * @param {string} key - Chave de descriptografia
 * @returns {string} Texto descriptografado
 */
const decrypt = (encryptedData, key = config.security.sessionSecret) => {
  try {
    const cryptoKey = crypto.createHash('sha256').update(key).digest();
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      cryptoKey,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Erro ao descriptografar: ${error.message}`);
  }
};

/**
 * Gera hash SHA-256
 * @param {string} text - Texto para hash
 * @returns {string} Hash hexadecimal
 */
const sha256Hash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Gera hash HMAC-SHA256
 * @param {string} text - Texto para hash
 * @param {string} secret - Chave secreta
 * @returns {string} Hash hexadecimal
 */
const hmacSha256 = (text, secret) => {
  return crypto.createHmac('sha256', secret).update(text).digest('hex');
};

/**
 * Valida força de senha
 * @param {string} password - Senha a validar
 * @returns {Object} Resultado da validação
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isValid = 
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar;
  
  return {
    isValid,
    errors: {
      minLength: password.length < minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers,
      hasSpecialChar: !hasSpecialChar,
    },
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateUUID,
  encrypt,
  decrypt,
  sha256Hash,
  hmacSha256,
  validatePasswordStrength,
};

