// Webhook Handler for Telegram Responses
// This file handles incoming responses from the Telegram webhook server

import { sendTelegramResponse } from '../firebase/firestoreService';

/**
 * Handle incoming webhook from Telegram webhook server
 * This function processes responses from Telegram and stores them in Firebase
 */
export const handleTelegramWebhookResponse = async (webhookData) => {
  try {
    console.log('📨 Received webhook from Telegram server:', webhookData);

    const { userId, message } = webhookData;

    if (!userId || !message) {
      console.error('❌ Missing required fields: userId or message');
      return { success: false, error: 'Missing required fields' };
    }

    // Store the response in Firebase with the correct userId
    const messageId = await sendTelegramResponse(message, userId, null);
    
    console.log('✅ Telegram response stored successfully:', messageId);
    
    return { 
      success: true, 
      messageId,
      userId,
      message: 'Response stored successfully'
    };

  } catch (error) {
    console.error('❌ Error handling Telegram webhook response:', error);
    return { 
      success: false, 
      error: error.message || 'Internal server error'
    };
  }
};

/**
 * Express.js endpoint handler for /api/telegram-response
 * Use this in your backend API routes
 */
export const telegramResponseApiHandler = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const result = await handleTelegramWebhookResponse(req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ API handler error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

/**
 * Validate webhook payload
 */
const validateWebhookPayload = (payload) => {
  const required = ['userId', 'message'];
  const missing = required.filter(field => !payload[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
};

/**
 * Send a test response to demonstrate the chat system working
 * This function simulates a response from the support team
 */
export const sendTestTelegramResponse = async (message, userId = 'test-user') => {
  try {
    console.log('📤 Sending test Telegram response:', message);
    
    // Store the test response in Firebase
    const messageId = await sendTelegramResponse(message, userId, null);
    
    console.log('✅ Test response sent successfully:', messageId);
    
    return { 
      success: true, 
      messageId,
      userId,
      message: 'Test response sent successfully'
    };

  } catch (error) {
    console.error('❌ Error sending test Telegram response:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send test response'
    };
  }
};

// Export all functions
const webhookHandler = {
  handleTelegramWebhookResponse,
  telegramResponseApiHandler,
  validateWebhookPayload,
  sendTestTelegramResponse
};

export default webhookHandler;