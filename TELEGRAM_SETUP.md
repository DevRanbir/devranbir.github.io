# Telegram Bot Webhook Server

This is a simple Node.js/Express server that acts as a webhook endpoint for your Telegram bot. It handles incoming messages from Telegram and forwards responses back to your Firebase chat system.

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Save the Bot Token you receive

### 2. Get Your Chat ID

1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":YOUR_CHAT_ID}`
4. Save this Chat ID

### 3. Deploy the Webhook Server

Create a new Node.js project and deploy it to a service like Vercel, Netlify, or Heroku:

```javascript
// server.js (or api/webhook.js for Vercel)
const express = require('express');
const app = express();
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());

// Import Firebase Admin SDK (optional, for direct Firebase access)
// const admin = require('firebase-admin');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const FIREBASE_WEBHOOK_URL = process.env.FIREBASE_WEBHOOK_URL; // Your website's webhook endpoint

// Webhook endpoint for Telegram
app.post('/webhook/telegram', async (req, res) => {
  try {
    const update = req.body;
    
    // Handle message from Telegram admin
    if (update.message && update.message.text) {
      const message = update.message;
      
      // Check if this is a reply to a user message
      if (message.reply_to_message && message.reply_to_message.text) {
        const originalText = message.reply_to_message.text;
        const userIdMatch = originalText.match(/🆔 ID: ([\\w_]+)/);
        
        if (userIdMatch) {
          const userId = userIdMatch[1];
          const responseText = message.text;
          
          // Forward response to your website's Firebase
          await fetch(`${FIREBASE_WEBHOOK_URL}/api/telegram-response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              message: responseText,
              timestamp: new Date().toISOString()
            })
          });
          
          // Confirm to Telegram admin
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: message.chat.id,
              text: `✅ Response sent to user ${userId}`,
              reply_to_message_id: message.message_id
            })
          });
        }
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// For Vercel deployment
module.exports = app;

// For traditional hosting
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
  });
}
```

### 4. Environment Variables

Set these environment variables in your webhook server:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
FIREBASE_WEBHOOK_URL=https://your-website.com
```

### 5. Set Your Bot Webhook

After deploying your webhook server, set your Telegram bot's webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-webhook-server.com/webhook/telegram"}'
```

### 6. Update Your React App Environment Variables

Add these to your React app's `.env` file:

```env
REACT_APP_TELEGRAM_BOT_TOKEN=your_bot_token_here
REACT_APP_TELEGRAM_CHAT_ID=your_chat_id_here
REACT_APP_TELEGRAM_WEBHOOK_URL=https://your-webhook-server.com/webhook/telegram
```

## How It Works

1. **User sends message** → Stored in Firebase → Webhook notifies Telegram bot
2. **Admin responds in Telegram** → Webhook receives response → Updates Firebase
3. **User sees response** → Real-time update via Firebase listeners

## Testing

1. Go to your website's chatbox
2. Send a test message
3. Check your Telegram chat for the notification
4. Reply to the message in Telegram
5. Check that the response appears in your website's chatbox

## Security Notes

- Keep your bot token secure
- Use HTTPS for all webhook endpoints
- Validate incoming webhook data
- Consider rate limiting
- Monitor webhook logs for suspicious activity

## Deployment Options

### Vercel (Recommended)
```bash
npm install vercel -g
vercel --prod
```

### Netlify Functions
```javascript
// netlify/functions/telegram-webhook.js
exports.handler = async (event, context) => {
  // Your webhook logic here
};
```

### Railway/Heroku
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```
