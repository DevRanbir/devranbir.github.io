/**
 * Test script for chat message cleanup functionality
 * Run this in the browser console to test the cleanup system
 */

import { 
  sendChatMessage, 
  sendTelegramResponse, 
  cleanupExpiredMessages, 
  manualCleanup,
  subscribeToChatMessages 
} from '../firebase/firestoreService';

/**
 * Test the complete cleanup flow
 */
export const testCleanupFlow = async () => {
  console.log('🧪 Starting cleanup flow test...');
  
  const testUserId = `cleanup-test-${Date.now()}`;
  
  try {
    // Step 1: Create some test messages
    console.log('📤 Step 1: Creating test messages...');
    
    const message1 = await sendChatMessage('Test message 1', testUserId, 'Test User');
    const message2 = await sendTelegramResponse('Test response 1', testUserId);
    const message3 = await sendChatMessage('Test message 2', testUserId, 'Test User');
    
    console.log('✅ Created test messages:', { message1, message2, message3 });
    
    // Step 2: Verify messages exist
    console.log('👂 Step 2: Verifying messages exist...');
    
    const unsubscribe = subscribeToChatMessages(testUserId, (messages) => {
      console.log(`📨 Found ${messages.length} messages before cleanup:`, messages);
      
      if (messages.length >= 3) {
        console.log('✅ All test messages found');
        
        // Step 3: Run cleanup (should not delete fresh messages)
        console.log('🧹 Step 3: Running cleanup (should not delete fresh messages)...');
        
        cleanupExpiredMessages().then(result => {
          console.log('🧹 Cleanup result:', result);
          
          // Step 4: Force cleanup of old messages for testing
          console.log('🧹 Step 4: Running manual cleanup with 0 hours (delete all)...');
          
          manualCleanup(0).then(manualResult => {
            console.log('🧹 Manual cleanup result:', manualResult);
            
            // Step 5: Verify messages are deleted
            setTimeout(() => {
              console.log('👂 Step 5: Verifying messages are deleted...');
              
              subscribeToChatMessages(testUserId, (finalMessages) => {
                console.log(`📨 Found ${finalMessages.length} messages after cleanup:`, finalMessages);
                
                if (finalMessages.length === 0) {
                  console.log('✅ All test messages successfully deleted!');
                } else {
                  console.log('⚠️ Some messages still remain');
                }
                
                unsubscribe();
              });
            }, 2000);
          });
        });
      }
    });
    
    return {
      success: true,
      testUserId,
      messageIds: [message1, message2, message3]
    };
    
  } catch (error) {
    console.error('❌ Cleanup test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test TTL field creation
 */
export const testTTLFields = async () => {
  console.log('🧪 Testing TTL field creation...');
  
  const testUserId = `ttl-test-${Date.now()}`;
  
  try {
    // Create a message and check if it has TTL fields
    const messageId = await sendChatMessage('TTL test message', testUserId, 'TTL Tester');
    
    console.log('✅ Message created with TTL fields:', messageId);
    
    // Subscribe to verify TTL fields
    const unsubscribe = subscribeToChatMessages(testUserId, (messages) => {
      if (messages.length > 0) {
        const message = messages[0];
        console.log('📨 Message data:', message);
        
        if (message.expiresAt) {
          const expiresAt = new Date(message.expiresAt.seconds * 1000);
          const now = new Date();
          const hoursUntilExpiry = (expiresAt - now) / (1000 * 60 * 60);
          
          console.log('✅ TTL field found!');
          console.log('⏰ Message expires at:', expiresAt.toLocaleString());
          console.log('⏳ Hours until expiry:', hoursUntilExpiry.toFixed(2));
          
          if (hoursUntilExpiry > 1.5 && hoursUntilExpiry < 2.5) {
            console.log('✅ TTL is correctly set to ~2 hours');
          } else {
            console.log('⚠️ TTL might not be set correctly');
          }
        } else {
          console.log('❌ No TTL field found in message');
        }
        
        unsubscribe();
      }
    });
    
    return {
      success: true,
      testUserId,
      messageId
    };
    
  } catch (error) {
    console.error('❌ TTL test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export test functions to window for easy access in console
if (typeof window !== 'undefined') {
  window.testCleanupFlow = testCleanupFlow;
  window.testTTLFields = testTTLFields;
}
