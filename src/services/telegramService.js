const axios = require('axios');
const logger = require('../utils/logger');

class TelegramService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  // Send message to user
  async sendMessage(chatId, text, options = {}) {
    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: options.parseMode || 'HTML',
        ...options,
      });

      return response.data;
    } catch (error) {
      logger.error('Telegram sendMessage error:', error);
      throw error;
    }
  }

  // Send job notification
  async sendJobNotification(chatId, job) {
    const message = `
🏢 <b>New Job Alert!</b>

📋 <b>${job.title}</b>
🏢 ${job.companyName}
💼 ${job.jobType}
💰 ${job.salaryRange || 'Negotiable'}
📍 ${job.location || 'Location not specified'}

${job.description.substring(0, 200)}...

<a href="${process.env.APP_URL}/jobs/${job.id}">View Full Details</a>
    `;

    return await this.sendMessage(chatId, message);
  }

  // Send application status update
  async sendApplicationUpdate(chatId, application) {
    const statusEmojis = {
      reviewed: '👀',
      shortlisted: '🌟',
      rejected: '❌',
    };

    const message = `
${statusEmojis[application.status]} <b>Application Update</b>

Position: ${application.job.title}
Company: ${application.job.companyName}
Status: ${application.status.toUpperCase()}

<a href="${process.env.APP_URL}/applications/${application.id}">View Application</a>
    `;

    return await this.sendMessage(chatId, message);
  }

  // Set webhook for mini app
  async setWebhook(url) {
    try {
      const response = await axios.post(`${this.apiUrl}/setWebhook`, {
        url: `${url}/api/v1/auth/telegram/webhook`,
        allowed_updates: ['message', 'callback_query'],
      });

      logger.info('Telegram webhook set:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Telegram setWebhook error:', error);
      throw error;
    }
  }

  // Handle webhook updates
  async handleWebhook(update) {
    try {
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      logger.error('Webhook handler error:', error);
    }
  }

  // Handle incoming messages
  async handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text;

    if (text === '/start') {
      await this.sendMessage(chatId, `
Welcome to Boss Jobs Ethiopia! 🎉

I can help you:
• Search for jobs
• Get job alerts
• Track applications
• Connect with employers

Commands:
/start - Show this menu
/jobs - Browse latest jobs
/search - Search for jobs
/profile - Manage your profile
/help - Get help
      `);
    } else if (text === '/jobs') {
      // Fetch and send latest jobs
      const response = await axios.get(`${process.env.API_URL}/api/v1/jobs?limit=5`);
      const jobs = response.data.data.jobs;

      if (jobs.length === 0) {
        await this.sendMessage(chatId, 'No jobs available at the moment.');
      } else {
        await this.sendMessage(chatId, '📋 <b>Latest Jobs</b>\n');
        for (const job of jobs) {
          await this.sendJobNotification(chatId, job);
        }
      }
    }
  }

  // Handle callback queries (inline buttons)
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Handle different callback actions
    switch (data) {
      case 'browse_jobs':
        await this.sendMessage(chatId, 'Use /jobs to browse available positions');
        break;
      default:
        await this.sendMessage(chatId, 'Unknown command');
    }
  }
}

module.exports = new TelegramService();
