import { z } from 'zod';
import { REGEX_PATTERNS } from './constants';

/**
 * Schemas de validação usando Zod
 */

// Schema para email
export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')
  .max(255, 'Email muito longo');

// Schema para senha
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(
    REGEX_PATTERNS.PASSWORD,
    'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
  );

// Schema para CPF
export const cpfSchema = z
  .string()
  .min(1, 'CPF é obrigatório')
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 11, 'CPF deve ter 11 dígitos')
  .refine(validateCPF, 'CPF inválido');

// Schema para CNPJ
export const cnpjSchema = z
  .string()
  .min(1, 'CNPJ é obrigatório')
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 14, 'CNPJ deve ter 14 dígitos')
  .refine(validateCNPJ, 'CNPJ inválido');

// Schema para telefone
export const phoneSchema = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato de telefone inválido');

// Schema para ticker/símbolo
export const tickerSchema = z
  .string()
  .min(1, 'Símbolo é obrigatório')
  .max(10, 'Símbolo muito longo')
  .transform((val) => val.toUpperCase())
  .refine((val) => /^[A-Z]{4}\d{1,2}$/.test(val), 'Formato de símbolo inválido');

// Schema para quantidade
export const quantitySchema = z
  .number()
  .min(1, 'Quantidade deve ser maior que 0')
  .max(999999, 'Quantidade muito alta')
  .int('Quantidade deve ser um número inteiro');

// Schema para preço
export const priceSchema = z
  .number()
  .min(0.01, 'Preço deve ser maior que R$ 0,01')
  .max(999999.99, 'Preço muito alto');

// Schema para valor monetário
export const monetarySchema = z
  .number()
  .min(0, 'Valor deve ser positivo')
  .max(999999999.99, 'Valor muito alto');

// Schema para login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
});

// Schema para registro
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Nome é obrigatório')
      .max(50, 'Nome muito longo'),
    lastName: z
      .string()
      .min(1, 'Sobrenome é obrigatório')
      .max(50, 'Sobrenome muito longo'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    cpf: cpfSchema,
    phone: phoneSchema,
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'Você deve aceitar os termos de uso'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

// Schema para perfil do usuário
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome muito longo'),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .max(50, 'Sobrenome muito longo'),
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 18;
    }, 'Você deve ter pelo menos 18 anos'),
  address: z.object({
    street: z.string().min(1, 'Endereço é obrigatório'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado inválido'),
    zipCode: z
      .string()
      .min(1, 'CEP é obrigatório')
      .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  }),
});

// Schema para ordem de compra/venda
export const orderSchema = z.object({
  symbol: tickerSchema,
  side: z.enum(['buy', 'sell'], {
    errorMap: () => ({ message: 'Lado da ordem inválido' }),
  }),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit'], {
    errorMap: () => ({ message: 'Tipo de ordem inválido' }),
  }),
  quantity: quantitySchema,
  price: priceSchema.optional(),
  stopPrice: priceSchema.optional(),
  timeInForce: z
    .enum(['day', 'gtc', 'ioc', 'fok'])
    .default('day')
    .optional(),
});

// Schema para watchlist
export const watchlistSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da lista é obrigatório')
    .max(50, 'Nome muito longo'),
  symbols: z
    .array(tickerSchema)
    .min(1, 'Adicione pelo menos um símbolo')
    .max(50, 'Máximo de 50 símbolos por lista'),
  isPublic: z.boolean().default(false),
});

// Schema para configurações de trading
export const tradingSettingsSchema = z.object({
  defaultOrderType: z.enum(['market', 'limit']).default('limit'),
  defaultTimeInForce: z.enum(['day', 'gtc']).default('day'),
  confirmOrders: z.boolean().default(true),
  maxOrderValue: monetarySchema.default(10000),
  riskLevel: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
  enableNotifications: z.boolean().default(true),
});

/**
 * Funções de validação auxiliares
 */

// Validar CPF
export function validateCPF(cpf) {
  if (!cpf || cpf.length !== 11) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  // Verificar se os dígitos calculados coincidem com os informados
  return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
}

// Validar CNPJ
export function validateCNPJ(cnpj) {
  if (!cnpj || cnpj.length !== 14) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Calcular primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;

  // Calcular segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;

  // Verificar se os dígitos calculados coincidem com os informados
  return digit1 === parseInt(cnpj.charAt(12)) && digit2 === parseInt(cnpj.charAt(13));
}

// Validar ticker B3
export function validateTicker(ticker) {
  if (!ticker) return false;
  return /^[A-Z]{4}\d{1,2}$/.test(ticker.toUpperCase());
}

// Validar se é um número positivo
export function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

// Validar se é um inteiro positivo
export function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

// Validar formato de data
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Validar se usuário é maior de idade
export function isAdult(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

export default {
  emailSchema,
  passwordSchema,
  cpfSchema,
  cnpjSchema,
  phoneSchema,
  tickerSchema,
  quantitySchema,
  priceSchema,
  monetarySchema,
  loginSchema,
  registerSchema,
  profileSchema,
  orderSchema,
  watchlistSchema,
  tradingSettingsSchema,
  validateCPF,
  validateCNPJ,
  validateTicker,
  isPositiveNumber,
  isPositiveInteger,
  isValidDate,
  isAdult,
};
