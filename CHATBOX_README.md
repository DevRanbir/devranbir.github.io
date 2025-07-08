# Website Chatbox with Firebase & Telegram Integration

This chatbox system creates a seamless 2-way communication channel between your website visitors and a Telegram bot, with all messages stored in Firebase for persistence and real-time updates.

## System Architecture

```
Website Chatbox (Anonymous Users)
            ↓↑
       Firebase Firestore (Message Storage)
            ↓↑
     Telegram Bot (via Webhook/Polling)
            ↓↑
      Support Team (Telegram Chat)
```

## Features

### 🔒 **Anonymous User System**
- Automatic generation of anonymous user IDs
- Optional user names (for personalization)
- No personal data collection beyond what user provides
- Persistent chat sessions using localStorage

### 💬 **Real-time Chat**
- Live message synchronization via Firebase
- Typing indicators
- Message timestamps
- Support for both user and support messages
- Automatic scrolling to latest messages

### 🤖 **Telegram Integration**
- Automatic notification to Telegram when users send messages
- 2-way communication through Telegram replies
- Formatted message display in Telegram
- Support team can respond directly from Telegram app

### 🎨 **Modern UI**
- Responsive design for all devices
- Fullscreen mode support
- Smooth animations and transitions
- Status indicators (online/offline)
- Dark theme integration

## How It Works

### 1. User Interaction Flow
1. User visits the website and clicks on Chatbox
2. User enters optional name and starts chat
3. Anonymous user ID is generated and stored locally
4. User sends messages which are stored in Firebase
5. User receives real-time responses from support team

### 2. Telegram Integration Flow
1. User message triggers Firebase function
2. Telegram bot is notified via webhook
3. Support team sees formatted message in Telegram
4. Support team replies directly in Telegram
5. Response is sent back to Firebase
6. User sees response in real-time on website

### 3. Data Storage Structure

Firebase stores messages with this structure:
```javascript
{
  message: "User's message text",
  userId: "user_1625097600000_abc123def",
  userName: "Anonymous User" | "John Doe",
  timestamp: Firestore.Timestamp,
  createdAt: "2023-07-01T12:00:00.000Z",
  isFromTelegram: false,
  messageType: "user" | "support"
}
```

## Setup Instructions

### 1. Firebase Setup (Already Configured)
- ✅ Firebase project configured
- ✅ Firestore collections set up
- ✅ Real-time listeners implemented
- ✅ Message storage functions ready

### 2. Telegram Bot Setup
Follow the detailed instructions in `TELEGRAM_SETUP.md`:
- Create a Telegram bot with @BotFather
- Get your bot token and chat ID
- Deploy webhook server
- Configure environment variables

### 3. Environment Variables
Add these to your `.env` file:
```env
REACT_APP_TELEGRAM_BOT_TOKEN=your_bot_token
REACT_APP_TELEGRAM_CHAT_ID=your_chat_id
REACT_APP_TELEGRAM_WEBHOOK_URL=your_webhook_url
```

## Usage

### For Website Visitors
1. Navigate to the Contacts page
2. Click on "Chatbox" in the navigation
3. Enter your name (optional) and start chatting
4. Send messages and receive responses in real-time
5. Use fullscreen mode for better experience

### For Support Team
1. Receive notifications in your Telegram chat
2. Reply directly to messages in Telegram
3. Responses automatically appear on the website
4. Monitor all conversations from one place

## Testing the System

### Quick Test (Without Telegram)
1. Go to the chatbox
2. Send a message
3. Click the "Test" button in the chatbox header
4. You should see a test response appear

### Full Integration Test
1. Complete Telegram setup
2. Send a message from the website
3. Check your Telegram for the notification
4. Reply in Telegram
5. Verify the response appears on the website

## File Structure

```
src/
├── components/
│   ├── ChatBox.js              # Main chatbox component
│   ├── Contacts.js             # Updated to use ChatBox
│   └── Contacts.css            # Enhanced styles
├── firebase/
│   └── firestoreService.js     # Firebase functions (updated)
└── services/
    ├── telegramService.js      # Telegram API integration
    └── webhookHandler.js       # Webhook response handling
```

## Security Considerations

### 🔐 **User Privacy**
- Anonymous user identification
- No personal data stored beyond what user provides
- Messages can be deleted/cleared
- Local storage for session persistence only

### 🛡️ **Data Protection**
- Firebase security rules (should be configured)
- HTTPS for all communications
- Webhook endpoint validation
- Rate limiting (recommended)

### 🔒 **API Security**
- Bot token kept secure in environment variables
- Webhook URL validation
- CORS configuration
- Error handling without data leakage

## Monitoring & Analytics

### Message Analytics
- Track message volume
- Response time metrics
- User engagement patterns
- Support team performance

### System Health
- Firebase connection status
- Telegram webhook status
- Error rate monitoring
- Performance metrics

## Customization Options

### UI Customization
- Modify colors in `Contacts.css`
- Adjust animation timings
- Customize message bubble styles
- Add emoji reactions

### Functionality Extensions
- File/image sharing
- Message reactions
- Typing indicators
- Read receipts
- Message search
- Chat history export

## Troubleshooting

### Common Issues
1. **Messages not sending**: Check Firebase configuration
2. **Telegram not receiving**: Verify bot token and webhook
3. **Responses not appearing**: Check webhook handler
4. **Styling issues**: Clear browser cache

### Debug Mode
Enable console logging to see detailed information:
```javascript
// In ChatBox.js, enable debug logging
const DEBUG_MODE = true;
```

## Future Enhancements

### Planned Features
- [ ] Admin dashboard for managing chats
- [ ] Chat analytics and reporting
- [ ] Multiple support agents
- [ ] Chat routing and assignment
- [ ] Automated responses/chatbots
- [ ] Multi-language support
- [ ] Voice message support
- [ ] Screen sharing capabilities

### Integration Possibilities
- [ ] WhatsApp Business API
- [ ] Discord integration
- [ ] Slack integration
- [ ] Email fallback
- [ ] SMS notifications
- [ ] Push notifications

## Support

If you need help setting up or customizing this chatbox system:

1. Check the troubleshooting section
2. Review the setup instructions
3. Test with the built-in test button
4. Check browser console for errors
5. Verify Firebase and Telegram configurations

## License

This chatbox system is part of your portfolio website and can be customized and extended as needed for your specific requirements.
