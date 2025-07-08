import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  sendChatMessage, 
  subscribeToChatMessages, 
  generateAnonymousUserId,
  testCompleteMessageFlow,
  startAutoCleanup,
  cleanupExpiredMessages,
  manualCleanup
} from '../firebase/firestoreService';
import { sendTestTelegramResponse } from '../services/webhookHandler';
import '../utils/cleanupTests'; // Import cleanup tests for console access

const ChatBox = ({ isFullScreen, onToggleFullScreen }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserSetup, setShowUserSetup] = useState(true);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const cleanupIntervalRef = useRef(null);

  // Define connectToChat function with useCallback to prevent unnecessary re-renders
  const connectToChat = useCallback((userIdToUse) => {
    try {
      setIsLoading(true);
      console.log('🔌 Connecting to chat for user:', userIdToUse);
      
      // Subscribe to messages for this user
      const unsubscribe = subscribeToChatMessages(userIdToUse, (newMessages) => {
        console.log('📨 ChatBox received messages update:', newMessages);
        setMessages(newMessages);
        setIsConnected(true);
        setIsLoading(false);
      });
      
      unsubscribeRef.current = unsubscribe;
      
      // Add welcome message if no messages exist
      setTimeout(() => {
        setMessages(prevMessages => {
          if (prevMessages.length === 0) {
            console.log('👋 Adding welcome message');
            return [{
              id: 'welcome',
              message: '👋 Hola, Type your message to start chatting...',
              userName: 'Support Team',
              messageType: 'support',
              timestamp: new Date(),
              createdAt: new Date().toISOString()
            }];
          }
          return prevMessages;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error connecting to chat:', error);
      setIsLoading(false);
    }
  }, []);

  // Initialize chat
  useEffect(() => {
    // Start auto-cleanup when component mounts
    cleanupIntervalRef.current = startAutoCleanup();
    
    // Check if user already has an ID stored
    const storedUserId = localStorage.getItem('chatUserId');
    const storedUserName = localStorage.getItem('chatUserName');
    
    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
      setShowUserSetup(false);
      connectToChat(storedUserId);
    }
  }, [connectToChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  const handleUserSetup = () => {
    if (!userName.trim()) {
      alert('Please enter your name to continue');
      return;
    }

    const newUserId = generateAnonymousUserId();
    setUserId(newUserId);
    
    // Store in localStorage for persistence
    localStorage.setItem('chatUserId', newUserId);
    localStorage.setItem('chatUserName', userName.trim());
    
    setShowUserSetup(false);
    connectToChat(newUserId);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      await sendChatMessage(messageToSend, userId, userName);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setInputMessage(messageToSend); // Restore message
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleResetChat = () => {
    if (window.confirm('This will start a new chat session. Are you sure?')) {
      localStorage.removeItem('chatUserId');
      localStorage.removeItem('chatUserName');
      setUserId('');
      setUserName('');
      setMessages([]);
      setShowUserSetup(true);
      setIsConnected(false);
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    }
  };

  const handleTestResponse = async () => {
    try {
      console.log('🧪 Running comprehensive message flow test...');
      const result = await testCompleteMessageFlow(userId);
      
      if (result.success) {
        console.log('✅ Test completed successfully!', result);
        alert('Test completed! Check the console for details.');
      } else {
        console.error('❌ Test failed:', result.error);
        alert('Test failed! Check the console for details.');
      }
    } catch (error) {
      console.error('Error running test:', error);
      alert('Test failed! Check the console for details.');
    }
  };

  const handleCleanupTest = async () => {
    try {
      console.log('🧹 Running manual cleanup test...');
      const result = await cleanupExpiredMessages();
      
      if (result.success) {
        console.log('✅ Cleanup completed successfully!', result);
        alert(`Cleanup completed! Deleted ${result.deletedCount} expired messages. Check console for details.`);
      } else {
        console.error('❌ Cleanup failed:', result.error);
        alert('Cleanup failed! Check the console for details.');
      }
    } catch (error) {
      console.error('Error running cleanup test:', error);
      alert('Cleanup test failed! Check the console for details.');
    }
  };

  if (showUserSetup) {
    return (
      <div className={`chatbox-container ${isFullScreen ? 'fullscreen' : ''}`}>
        <div className="chatbox-header">
          <div className="chatbox-status">
            <div className="status-indicator offline"></div>
            <span>Start New Chat</span>
          </div>
          <div className="chatbox-controls">
            <button 
              className="fullscreen-btn"
              onClick={onToggleFullScreen}
              title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullScreen ? (
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
                  <path d="M3 7V4a1 1 0 0 1 1-1h3m0 18H4a1 1 0 0 1-1-1v-3m18 0v3a1 1 0 0 1-1 1h-3m0-18h3a1 1 0 0 1 1 1v3"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="chatbox-setup">
          <div className="setup-content">
            <h3>Welcome to the Chat!</h3>
            <div className="setup-form">
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUserSetup()}
                className="setup-input"
                maxLength={50}
              />
              <button 
                onClick={handleUserSetup}
                className="setup-button"
              >
                Start Chat
              </button>
            </div>
            <div className="setup-info">
              <small>
                <span className="info-icon">🔒</span>
                Your identity remains anonymous but messages may not.
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chatbox-container ${isFullScreen ? 'fullscreen' : ''}`}>
      <div className="chatbox-header">
        <div className="chatbox-status">
          <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></div>
          <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
        <div className="chatbox-info">
          <span>Chatting as: {userName}</span>
        </div>
        <div className="chatbox-controls">
          <button 
            className="reset-btn"
            onClick={handleResetChat}
            title="Start New Chat"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>
          <button 
            className="test-btn"
            onClick={handleTestResponse}
            title="Send Test Response"
            style={{ 
              background: 'rgba(0, 255, 0, 0.1)', 
              border: '1px solid rgba(0, 255, 0, 0.3)',
              color: 'white',
              padding: '8px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Test
          </button>
          <button 
            className="cleanup-btn"
            onClick={handleCleanupTest}
            title="Manual Cleanup Test"
            style={{ 
              background: 'rgba(255, 165, 0, 0.1)', 
              border: '1px solid rgba(255, 165, 0, 0.3)',
              color: 'white',
              padding: '8px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              marginLeft: '4px'
            }}
          >
            🧹
          </button>
          <button 
            className="fullscreen-btn"
            onClick={onToggleFullScreen}
            title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullScreen ? (
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
                <path d="M3 7V4a1 1 0 0 1 1-1h3m0 18H4a1 1 0 0 1-1-1v-3m18 0v3a1 1 0 0 1-1 1h-3m0-18h3a1 1 0 0 1 1 1v3"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <div className="chatbox-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.messageType === 'support' ? 'support-message' : 'user-message'}`}
          >
            <div className="message-header">
              <span className="message-author">{message.userName}</span>
              <span className="message-timestamp">
                {formatTimestamp(message.timestamp || message.createdAt)}
              </span>
            </div>
            <div className="message-content">
              {message.message}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message support-message">
            <div className="message-header">
              <span className="message-author">Support Team</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chatbox-input-area">
        <div className="input-wrapper">
          <input 
            type="text" 
            placeholder="Type your message here..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !isConnected}
            className="chatbox-input"
            maxLength={500}
          />
          <button 
            className="send-btn" 
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim() || !isConnected}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
        <div className="input-info">
          <small>Messages are sent to our Telegram bot for quick responses</small>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
