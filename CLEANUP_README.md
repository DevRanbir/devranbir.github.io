 Chat Message Auto-Cleanup System

This system automatically deletes chat messages after 2 hours to maintain privacy and reduce database storage.

## Features

- **Automatic TTL**: All chat messages are created with a 2-hour expiration time
- **Background Cleanup**: Runs every 30 minutes to remove expired messages
- **Manual Cleanup**: Functions available for testing and manual cleanup
- **Cross-Platform**: Works in both React app and Telegram webhook server

## How It Works

### 1. Message Creation with TTL
When messages are created, they include an `expiresAt` field set to 2 hours in the future:

```javascript
const expiresAt = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
```

### 2. Automatic Cleanup
The cleanup system runs automatically when the app starts:

- **Initial cleanup**: Runs immediately when the app loads
- **Scheduled cleanup**: Runs every 30 minutes
- **Cleanup process**: Queries for messages where `expiresAt <= now` and deletes them

### 3. Manual Controls
For testing and debugging:

- **Manual cleanup button**: 🧹 button in the chat interface
- **Console commands**: `window.testCleanupFlow()` and `window.testTTLFields()`
- **Force cleanup**: `cleanupExpiredMessages()` function

## Functions Available

### Automatic Functions
- `startAutoCleanup()`: Starts the 30-minute cleanup interval
- `stopAutoCleanup(intervalId)`: Stops the cleanup interval
- `cleanupExpiredMessages()`: Removes messages where `expiresAt <= now`

### Manual Functions
- `manualCleanup(hoursOld)`: Deletes messages older than specified hours
- `testCompleteMessageFlow()`: Tests the complete chat flow including cleanup
- `testCleanupFlow()`: Tests the cleanup functionality specifically
- `testTTLFields()`: Verifies TTL fields are properly set

## Testing

### In Browser Console:
```javascript
// Test TTL field creation
await window.testTTLFields();

// Test complete cleanup flow
await window.testCleanupFlow();

// Manual cleanup of all messages older than 1 hour
await manualCleanup(1);

// Force cleanup of expired messages
await cleanupExpiredMessages();
```

### Via Chat Interface:
1. Click the 🧹 button to run manual cleanup
2. Click the "Test" button to run message flow tests
3. Check console for detailed logs

## File Structure

- `src/firebase/firestoreService.js`: Core cleanup functions
- `src/utils/chatCleanup.js`: Automatic cleanup initialization
- `src/utils/cleanupTests.js`: Test functions for cleanup system
- `src/components/ChatBox.js`: UI controls for cleanup testing
- `telegram-webhook-server/api/webhook.js`: Server-side TTL implementation

## Database Schema

Messages now include:
```javascript
{
  message: "Message content",
  userId: "user_123",
  userName: "User Name",
  timestamp: firebaseTimestamp,
  createdAt: "2025-01-01T12:00:00Z",
  expiresAt: firebaseTimestamp, // 2 hours after creation
  isFromTelegram: boolean,
  messageType: "user" | "support"
}
```

## Security & Privacy

- Messages are automatically deleted after 2 hours
- No personal data is stored beyond the 2-hour window
- Cleanup runs in the background without user intervention
- Manual cleanup available for immediate deletion if needed

## Deployment Notes

1. The cleanup system starts automatically when the app loads
2. No additional configuration needed
3. Works in both development and production environments
4. Handles both Firebase timestamps and JavaScript Date objects
5. Includes error handling for failed cleanup operations

## Troubleshooting

If cleanup isn't working:

1. Check browser console for cleanup logs
2. Verify Firebase permissions allow document deletion
3. Test with `window.testCleanupFlow()` in console
4. Check if TTL fields are being created with `window.testTTLFields()`

## Performance

- Cleanup queries use indexed fields for optimal performance
- Batch operations minimize database load
- Error handling prevents cleanup failures from affecting chat functionality
- Automatic retry logic for failed cleanup operations
