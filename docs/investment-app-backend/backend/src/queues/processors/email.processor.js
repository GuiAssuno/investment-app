const logger = require('../../utils/logger');

/**
 * Processador de Jobs de Email
 * Processa envio de emails em background
 */

/**
 * Processa job de envio de email
 * @param {Object} job - Job do Bull
 */
const processEmailJob = async (job) => {
  try {
    const { to, subject, html, text } = job.data;

    logger.info(`Processando envio de email para: ${to}`);

    // TODO: Implementar envio real de email usando nodemailer ou serviço de email
    // Por enquanto, apenas log
    logger.info(`Email enviado: ${subject} para ${to}`);

    return {
      success: true,
      to,
      subject,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Erro ao processar job de email:', error);
    throw error;
  }
};

module.exports = processEmailJob;

