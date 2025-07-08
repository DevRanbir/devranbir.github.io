// Telegram Bot Integration Service
// This file demonstrates how to integrate with a Telegram bot for 2-way communication

import { sendTelegramResponse } from '../firebase/firestoreService';

// Configuration (Replace with your actual bot token and chat ID)
const TELEGRAM_CONFIG = {
  botToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '8118284542:AAG-XJMrd1EelpOY8g2eKGOhitzmHfjWwmo',
  chatId: process.env.REACT_APP_TELEGRAM_CHAT_ID || '5135890857',
  webhookUrl: process.env.REACT_APP_TELEGRAM_WEBHOOK_URL || 'https://telegram-webhook-server-production.up.railway.app/api/webhook/telegram'
};

/**
 * Send a message to Telegram bot/chat
 * This function sends a notification to Telegram when a user sends a message
 */
export const notifyTelegramBot = async (messageData) => {
  try {
    const telegramMessage = formatMessageForTelegram(messageData);
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.chatId,
        text: telegramMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Reply",
              callback_data: `reply_${messageData.messageId}_${messageData.userId}`
            }
          ]]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Message sent to Telegram:', result);
    return result;
    
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    throw error;
  }
};

/**
 * Format message for Telegram display
 */
const formatMessageForTelegram = (messageData) => {
  const timestamp = new Date(messageData.createdAt).toLocaleString();
  
  return `
🔔 <b>New Website Message</b>

👤 <b>User:</b> ${messageData.userName}
🆔 <b>ID:</b> <code>${messageData.userId}</code>
⏰ <b>Time:</b> ${timestamp}

💬 <b>Message:</b>
${messageData.message}

---
Reply to this message to respond to the user.
  `.trim();
};

/**
 * Handle incoming webhook from Telegram
 * This function processes responses from Telegram and sends them back to the chat
 */
export const handleTelegramWebhook = async (webhookData) => {
  try {
    // Handle callback query (inline button press)
    if (webhookData.callback_query) {
      const callbackData = webhookData.callback_query.data;
      
      if (callbackData.startsWith('reply_')) {
        const [, messageId, userId] = callbackData.split('_');
        
        // Send acknowledgment to Telegram
        await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: webhookData.callback_query.id,
            text: "Please reply to this message to send a response to the user."
          })
        });
        
        return { success: true, action: 'reply_prompt', userId, messageId };
      }
    }
    
    // Handle regular message (response from admin)
    if (webhookData.message && webhookData.message.text) {
      const message = webhookData.message;
      
      // Check if this is a reply to a user message
      if (message.reply_to_message && message.reply_to_message.text) {
        const originalText = message.reply_to_message.text;
        const userIdMatch = originalText.match(/🆔 <b>ID:<\/b> <code>([^<]+)<\/code>/);
        
        if (userIdMatch) {
          const userId = userIdMatch[1];
          const responseText = message.text;
          
          // Send response back to Firebase (which will notify the user)
          await sendTelegramResponse(responseText, userId, null);
          
          // Confirm to Telegram admin
          await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CONFIG.chatId,
              text: `✅ Response sent to user ${userId}`,
              reply_to_message_id: message.message_id
            })
          });
          
          return { success: true, action: 'response_sent', userId };
        }
      }
    }
    
    return { success: true, action: 'no_action' };
    
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    throw error;
  }
};

/**
 * Set up Telegram webhook
 * Call this function to configure your Telegram bot webhook
 */
export const setupTelegramWebhook = async () => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: TELEGRAM_CONFIG.webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });

    const result = await response.json();
    console.log('Webhook setup result:', result);
    return result;
    
  } catch (error) {
    console.error('Error setting up webhook:', error);
    throw error;
  }
};

/**
 * Get bot information
 */
export const getBotInfo = async () => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getMe`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting bot info:', error);
    throw error;
  }
};

// Export configuration for use in other files
export { TELEGRAM_CONFIG };
