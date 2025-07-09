import { db } from './config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

// Document ID for homepage data
const HOMEPAGE_DOC_ID = 'homepage-data';
// Document ID for documents data
const DOCUMENTS_DOC_ID = 'documents-data';
// Document ID for projects data
const PROJECTS_DOC_ID = 'projects-data';
// Document ID for about data
const ABOUT_DOC_ID = 'about-data';
// Document ID for contacts data
const CONTACTS_DOC_ID = 'contacts-data';

// Chat collection reference
const CHAT_COLLECTION = 'chat-messages';

// GitHub sync configuration
const GITHUB_SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const GITHUB_SYNC_DOC_ID = 'github-sync-metadata';

// Collection and document references
const homepageDocRef = doc(db, 'website-content', HOMEPAGE_DOC_ID);
const documentsDocRef = doc(db, 'website-content', DOCUMENTS_DOC_ID);
const projectsDocRef = doc(db, 'website-content', PROJECTS_DOC_ID);
const aboutDocRef = doc(db, 'website-content', ABOUT_DOC_ID);
const contactsDocRef = doc(db, 'website-content', CONTACTS_DOC_ID);

// GitHub sync metadata document reference
const githubSyncDocRef = doc(db, 'website-content', GITHUB_SYNC_DOC_ID);

// Default data structure
const defaultData = {
  socialLinks: [
    { id: 'github', url: 'https://github.com/yourname' },
    { id: 'linkedin', url: 'https://linkedin.com/in/yourname' },
    { id: 'twitter', url: 'https://twitter.com/yourname' },
    { id: 'instagram', url: 'https://instagram.com/yourname' },
    { id: 'mail', url: 'mailto:your.email@example.com' },
  ],
  authorDescription: "Full-stack developer passionate about creating beautiful web experiences. Specializing in React, Node.js, and modern JavaScript frameworks to build responsive and intuitive applications.",
  authorSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'C++', 'HTML/CSS', 'MongoDB', 'Express.js'],
  lastUpdated: new Date().toISOString()
};

// Default documents data structure
const defaultDocumentsData = {
  documents: [],
  lastUpdated: new Date().toISOString()
};

// Default projects data structure
const defaultProjectsData = {
  projects: [],
  lastUpdated: new Date().toISOString()
};

// Default about data structure
const defaultAboutData = {
  githubReadmeUrl: 'https://api.github.com/repos/DevRanbir/DevRanbir/readme',
  githubUsername: 'DevRanbir',
  repositoryName: 'DevRanbir',
  lastUpdated: new Date().toISOString()
};

// Default contacts data structure
const defaultContactsData = {
  description: "Hola, I'd love to hear from you! Whether you have a question, a project idea, or just want to connect, feel free to reach out anytime. Use the live chat to start a conversation in real-time, explore the links to my work, or see where I'm currently based. I'm always happy to talk and aim to reply promptly. Let's connect!",
  socialBubbles: [
    { id: 'email', url: 'mailto:your.email@example.com', size: 80, color: '#be00ff', x: 15, y: 20 },
    { id: 'phone', url: 'tel:+1234567890', size: 65, color: '#8b00cc', x: 70, y: 15 },
    { id: 'linkedin', url: 'https://linkedin.com/in/yourname', size: 90, color: '#e600ff', x: 25, y: 55 },
    { id: 'twitter', url: 'https://twitter.com/yourname', size: 70, color: '#d400e6', x: 75, y: 60 },
    { id: 'github', url: 'https://github.com/yourname', size: 85, color: '#be00ff', x: 50, y: 85 },
    { id: 'discord', url: 'https://discord.gg/yourserver', size: 75, color: '#cc00e6', x: 10, y: 80 }
  ],
  locationDetails: {
    location: 'Khanna City, Punjab, India',
    responseTime: 'within 24 hours',
    status: 'Available'
  },
  lastUpdated: new Date().toISOString()
};

// Initialize the document with default data if it doesn't exist
export const initializeHomepageData = async () => {
  try {
    const docSnap = await getDoc(homepageDocRef);
    
    if (!docSnap.exists()) {
      await setDoc(homepageDocRef, defaultData);
      console.log('Homepage data initialized with default values');
      return defaultData;
    } else {
      console.log('Homepage data already exists');
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error initializing homepage data:', error);
    throw error;
  }
};

// Get homepage data
export const getHomepageData = async () => {
  try {
    const docSnap = await getDoc(homepageDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If document doesn't exist, initialize it
      return await initializeHomepageData();
    }
  } catch (error) {
    console.error('Error getting homepage data:', error);
    throw error;
  }
};

// Update social links
export const updateSocialLinks = async (socialLinks) => {
  try {
    await updateDoc(homepageDocRef, {
      socialLinks: socialLinks.map(({ id, url }) => ({ id, url })), // Remove JSX icons for storage
      lastUpdated: new Date().toISOString()
    });
    console.log('Social links updated successfully');
  } catch (error) {
    console.error('Error updating social links:', error);
    throw error;
  }
};

// Update author description
export const updateAuthorDescription = async (description) => {
  try {
    await updateDoc(homepageDocRef, {
      authorDescription: description,
      lastUpdated: new Date().toISOString()
    });
    console.log('Author description updated successfully');
  } catch (error) {
    console.error('Error updating author description:', error);
    throw error;
  }
};

// Update author skills
export const updateAuthorSkills = async (skills) => {
  try {
    await updateDoc(homepageDocRef, {
      authorSkills: skills,
      lastUpdated: new Date().toISOString()
    });
    console.log('Author skills updated successfully');
  } catch (error) {
    console.error('Error updating author skills:', error);
    throw error;
  }
};

// Listen to real-time updates
export const subscribeToHomepageData = (callback) => {
  return onSnapshot(homepageDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      console.log('No such document!');
    }
  }, (error) => {
    console.error('Error listening to homepage data:', error);
  });
};

// Update all homepage data at once
export const updateHomepageData = async (data) => {
  try {
    const updateData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Remove JSX icons from social links before storing
    if (updateData.socialLinks) {
      updateData.socialLinks = updateData.socialLinks.map(({ id, url }) => ({ id, url }));
    }
    
    await updateDoc(homepageDocRef, updateData);
    console.log('Homepage data updated successfully');
  } catch (error) {
    console.error('Error updating homepage data:', error);
    throw error;
  }
};

// Documents Related Functions

// Initialize documents data
export const initializeDocumentsData = async () => {
  try {
    const docSnap = await getDoc(documentsDocRef);
    
    if (!docSnap.exists()) {
      await setDoc(documentsDocRef, defaultDocumentsData);
      console.log('Documents data initialized with default values');
      return defaultDocumentsData;
    } else {
      console.log('Documents data already exists');
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error initializing documents data:', error);
    throw error;
  }
};

// Get documents data
export const getDocumentsData = async () => {
  try {
    const docSnap = await getDoc(documentsDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If document doesn't exist, initialize it
      return await initializeDocumentsData();
    }
  } catch (error) {
    console.error('Error getting documents data:', error);
    throw error;
  }
};

// Update documents
export const updateDocuments = async (documents) => {
  try {
    await updateDoc(documentsDocRef, {
      documents: documents,
      lastUpdated: new Date().toISOString()
    });
    console.log('Documents updated successfully');
  } catch (error) {
    console.error('Error updating documents:', error);
    throw error;
  }
};

// Listen to real-time updates for documents
export const subscribeToDocumentsData = (callback) => {
  return onSnapshot(documentsDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      console.log('No documents data document!');
    }
  }, (error) => {
    console.error('Error listening to documents data:', error);
  });
};

// Projects Related Functions

// Initialize projects data
export const initializeProjectsData = async () => {
  try {
    const docSnap = await getDoc(projectsDocRef);
    
    if (!docSnap.exists()) {
      await setDoc(projectsDocRef, defaultProjectsData);
      console.log('Projects data initialized with default values');
      return defaultProjectsData;
    } else {
      console.log('Projects data already exists');
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error initializing projects data:', error);
    throw error;
  }
};

// Get projects data
export const getProjectsData = async () => {
  try {
    const docSnap = await getDoc(projectsDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If document doesn't exist, initialize it
      return await initializeProjectsData();
    }
  } catch (error) {
    console.error('Error getting projects data:', error);
    throw error;
  }
};

// Update projects with automatic user edit tracking
export const updateProjects = async (projects) => {
  try {
    // Get current projects to compare for user edits
    const currentProjectsData = await getProjectsData();
    const currentProjects = currentProjectsData.projects || [];
    
    // Track user edits for GitHub projects
    const updatedProjects = projects.map(project => {
      const currentProject = currentProjects.find(p => p.id === project.id);
      
      // If this is a GitHub project and description changed, mark as user-edited
      if (currentProject && currentProject.isFromGitHub && project.isFromGitHub) {
        const oldDescription = currentProject.description || '';
        const newDescription = project.description || '';
        
        // Only mark as user-edited if description actually changed and it's not a sync operation
        if (oldDescription !== newDescription && !project.lastGithubSync) {
          console.log(`📝 User edit detected for ${project.name}: marking as user-edited`);
          return {
            ...project,
            userEdited: true,
            lastUserEdit: new Date().toISOString()
          };
        } else if (project.lastGithubSync && oldDescription !== newDescription) {
          // This is a sync operation - preserve existing user edit status but update sync info
          return {
            ...project,
            userEdited: currentProject.userEdited || false,
            lastUserEdit: currentProject.lastUserEdit || null
          };
        }
      }
      
      return project;
    });
    
    await updateDoc(projectsDocRef, {
      projects: updatedProjects,
      lastUpdated: new Date().toISOString()
    });
    console.log('Projects updated successfully with edit tracking');
  } catch (error) {
    console.error('Error updating projects:', error);
    throw error;
  }
};

// Listen to real-time updates for projects
export const subscribeToProjectsData = (callback) => {
  return onSnapshot(projectsDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

// === ABOUT DATA MANAGEMENT ===

// Initialize about data
export const initializeAboutData = async () => {
  try {
    const docSnap = await getDoc(aboutDocRef);
    
    if (!docSnap.exists()) {
      await setDoc(aboutDocRef, defaultAboutData);
      console.log('About data initialized with default values');
      return defaultAboutData;
    } else {
      console.log('About data already exists');
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error initializing about data:', error);
    throw error;
  }
};

// Get about data
export const getAboutData = async () => {
  try {
    const docSnap = await getDoc(aboutDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If document doesn't exist, initialize it
      return await initializeAboutData();
    }
  } catch (error) {
    console.error('Error getting about data:', error);
    throw error;
  }
};

// Update about data
export const updateAboutData = async (aboutData) => {
  try {
    await updateDoc(aboutDocRef, {
      ...aboutData,
      lastUpdated: new Date().toISOString()
    });
    console.log('About data updated successfully');
  } catch (error) {
    console.error('Error updating about data:', error);
    throw error;
  }
};

// Listen to real-time updates for about data
export const subscribeToAboutData = (callback) => {
  return onSnapshot(aboutDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

// Contacts Related Functions

// Initialize contacts data with default values if document doesn't exist
export const initializeContactsData = async () => {
  try {
    const docSnap = await getDoc(contactsDocRef);
    
    if (!docSnap.exists()) {
      await setDoc(contactsDocRef, defaultContactsData);
      console.log('Contacts data initialized with default values');
      return defaultContactsData;
    } else {
      console.log('Contacts data already exists');
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error initializing contacts data:', error);
    throw error;
  }
};

// Get contacts data from Firestore
export const getContactsData = async () => {
  try {
    const docSnap = await getDoc(contactsDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If document doesn't exist, initialize it
      return await initializeContactsData();
    }
  } catch (error) {
    console.error('Error getting contacts data:', error);
    throw error;
  }
};

// Update contacts description
export const updateContactsDescription = async (description) => {
  try {
    await updateDoc(contactsDocRef, {
      description: description,
      lastUpdated: new Date().toISOString()
    });
    console.log('Contacts description updated successfully');
  } catch (error) {
    console.error('Error updating contacts description:', error);
    throw error;
  }
};

// Update social media bubbles
export const updateSocialBubbles = async (socialBubbles) => {
  try {
    await updateDoc(contactsDocRef, {
      socialBubbles: socialBubbles,
      lastUpdated: new Date().toISOString()
    });
    console.log('Social bubbles updated successfully');
  } catch (error) {
    console.error('Error updating social bubbles:', error);
    throw error;
  }
};

// Update location details
export const updateLocationDetails = async (locationDetails) => {
  try {
    await updateDoc(contactsDocRef, {
      locationDetails: locationDetails,
      lastUpdated: new Date().toISOString()
    });
    console.log('Location details updated successfully');
  } catch (error) {
    console.error('Error updating location details:', error);
    throw error;
  }
};

// Listen to real-time updates for contacts data
export const subscribeToContactsData = (callback) => {
  return onSnapshot(contactsDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

// ====================== CHAT FUNCTIONS ======================

// Generate anonymous user ID
export const generateAnonymousUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Send a message to chat
export const sendChatMessage = async (message, userId, userName = null) => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
    
    const chatMessage = {
      message: message.trim(),
      userId: userId,
      userName: userName || `Anonymous User`,
      timestamp: serverTimestamp(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt, // TTL field for automatic deletion
      isFromTelegram: false,
      messageType: 'user'
    };

    const docRef = await addDoc(collection(db, CHAT_COLLECTION), chatMessage);
    console.log('Message sent successfully with ID:', docRef.id);
    
    // Trigger Telegram bot webhook (if configured)
    await notifyTelegramBot(chatMessage, docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Send response from Telegram bot
export const sendTelegramResponse = async (message, userId, originalMessageId = null) => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
    
    const chatMessage = {
      message: message.trim(),
      userId: userId,
      userName: 'Support Team',
      timestamp: serverTimestamp(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt, // TTL field for automatic deletion
      isFromTelegram: true,
      messageType: 'support',
      originalMessageId: originalMessageId
    };

    const docRef = await addDoc(collection(db, CHAT_COLLECTION), chatMessage);
    console.log('Telegram response sent successfully with ID:', docRef.id, 'for user:', userId);
    return docRef.id;
  } catch (error) {
    console.error('Error sending Telegram response:', error);
    throw error;
  }
};

// Subscribe to chat messages for a user
export const subscribeToChatMessages = (userId, callback) => {
  try {
    const q = query(
      collection(db, CHAT_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        messages.push({
          id: doc.id,
          ...docData
        });
      });
      
      console.log(`📨 Found ${messages.length} messages for user ${userId}:`, messages);
      
      // Handle both Firebase timestamps and JavaScript Date objects
      messages.sort((a, b) => {
        // Handle both Firebase timestamps and JavaScript Date objects
        let timeA, timeB;
        
        if (a.timestamp?.toMillis) {
          timeA = a.timestamp.toMillis();
        } else if (a.timestamp?.getTime) {
          timeA = a.timestamp.getTime();
        } else {
          timeA = new Date(a.createdAt).getTime();
        }
        
        if (b.timestamp?.toMillis) {
          timeB = b.timestamp.toMillis();
        } else if (b.timestamp?.getTime) {
          timeB = b.timestamp.getTime();
        } else {
          timeB = new Date(b.createdAt).getTime();
        }
        
        return timeA - timeB;
      });
      
      callback(messages);
    });
  } catch (error) {
    console.error('Error subscribing to chat messages:', error);
    throw error;
  }
};

// Subscribe to all chat messages (for admin/bot)
export const subscribeToAllChatMessages = (callback) => {
  try {
    const q = query(
      collection(db, CHAT_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      callback(messages);
    });
  } catch (error) {
    console.error('Error subscribing to all chat messages:', error);
    throw error;
  }
};

// Notify Telegram bot about new message
const notifyTelegramBot = async (message, messageId) => {
  try {
    // Import the Telegram service dynamically to avoid circular dependencies
    const { notifyTelegramBot: telegramNotify } = await import('../services/telegramService');
    
    const messageData = {
      ...message,
      messageId: messageId
    };
    
    await telegramNotify(messageData);
    
  } catch (error) {
    console.error('Error notifying Telegram bot:', error);
    // Don't throw error as this shouldn't block the main chat functionality
  }
};

/**
 * Comprehensive test function to verify the complete message flow
 * Call this function from the browser console to test the chat system
 */
export const testCompleteMessageFlow = async (testUserId = 'test-user-flow') => {
  try {
    console.log('🧪 Starting complete message flow test...');
    
    // Step 1: Send a user message (simulate website message)
    console.log('📤 Step 1: Sending user message...');
    const userMessageId = await sendChatMessage(
      'This is a test message from the website', 
      testUserId, 
      'Test User'
    );
    console.log('✅ User message sent with ID:', userMessageId);
    
    // Step 2: Simulate Telegram response (what should happen when admin replies)
    console.log('📤 Step 2: Sending test Telegram response...');
    const telegramResponseId = await sendTelegramResponse(
      'This is a test response from Telegram support',
      testUserId,
      userMessageId
    );
    console.log('✅ Telegram response sent with ID:', telegramResponseId);
    
    // Step 3: Subscribe to messages and verify both appear
    console.log('👂 Step 3: Listening for messages...');
    const unsubscribe = subscribeToChatMessages(testUserId, (messages) => {
      console.log(`📨 Received ${messages.length} messages for user ${testUserId}:`);
      messages.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.messageType}] ${msg.userName}: ${msg.message}`);
        console.log(`     - ID: ${msg.id}`);
        console.log(`     - From Telegram: ${msg.isFromTelegram || false}`);
        console.log(`     - Timestamp: ${msg.timestamp || msg.createdAt}`);
      });
      
      if (messages.length >= 2) {
        console.log('✅ Both messages found! Flow test successful.');
        unsubscribe(); // Stop listening after verification
      }
    });
    
    // Stop test after 10 seconds if not completed
    setTimeout(() => {
      unsubscribe();
      console.log('⏰ Test timeout reached');
    }, 10000);
    
    return {
      success: true,
      testUserId,
      userMessageId,
      telegramResponseId
    };
    
  } catch (error) {
    console.error('❌ Message flow test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete expired chat messages (older than 2 hours)
 * This function should be called periodically to clean up old messages
 */
export const cleanupExpiredMessages = async () => {
  try {
    const now = new Date();
    console.log('🧹 Starting cleanup of expired messages...');
    
    // Query for messages that have expired
    const q = query(
      collection(db, CHAT_COLLECTION),
      where('expiresAt', '<=', now)
    );
    
    const querySnapshot = await getDocs(q);
    const deletedMessages = [];
    
    // Delete each expired message
    for (const docSnapshot of querySnapshot.docs) {
      try {
        await deleteDoc(docSnapshot.ref);
        deletedMessages.push({
          id: docSnapshot.id,
          userId: docSnapshot.data().userId,
          message: docSnapshot.data().message.substring(0, 50) + '...'
        });
        console.log(`🗑️ Deleted expired message: ${docSnapshot.id}`);
      } catch (deleteError) {
        console.error(`❌ Error deleting message ${docSnapshot.id}:`, deleteError);
      }
    }
    
    console.log(`✅ Cleanup completed. Deleted ${deletedMessages.length} expired messages.`);
    
    return {
      success: true,
      deletedCount: deletedMessages.length,
      deletedMessages: deletedMessages
    };
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Start automatic cleanup interval
 * This will run cleanup every 30 minutes
 */
export const startAutoCleanup = () => {
  console.log('🕒 Starting automatic cleanup interval (every 30 minutes)...');
  
  // Run cleanup immediately
  cleanupExpiredMessages();
  
  // Set up interval to run every 30 minutes
  const cleanupInterval = setInterval(() => {
    cleanupExpiredMessages();
  }, 30 * 60 * 1000); // 30 minutes in milliseconds
  
  // Return the interval ID so it can be cleared if needed
  return cleanupInterval;
};

/**
 * Stop automatic cleanup
 */
export const stopAutoCleanup = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('🛑 Automatic cleanup stopped.');
  }
};

/**
 * Manual cleanup function for testing
 * This will delete all messages older than the specified hours
 */
export const manualCleanup = async (hoursOld = 2) => {
  try {
    const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000));
    console.log(`🧹 Manual cleanup: Deleting messages older than ${hoursOld} hours...`);
    
    const q = query(
      collection(db, CHAT_COLLECTION),
      where('timestamp', '<', cutoffTime)
    );
    
    const querySnapshot = await getDocs(q);
    const deletedMessages = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      try {
        await deleteDoc(docSnapshot.ref);
        deletedMessages.push({
          id: docSnapshot.id,
          userId: docSnapshot.data().userId,
          createdAt: docSnapshot.data().createdAt
        });
        console.log(`🗑️ Deleted old message: ${docSnapshot.id}`);
      } catch (deleteError) {
        console.error(`❌ Error deleting message ${docSnapshot.id}:`, deleteError);
      }
    }
    
    console.log(`✅ Manual cleanup completed. Deleted ${deletedMessages.length} old messages.`);
    
    return {
      success: true,
      deletedCount: deletedMessages.length,
      cutoffTime: cutoffTime.toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error during manual cleanup:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ====================== GITHUB SYNC FUNCTIONS ======================

/**
 * Get GitHub sync metadata
 */
export const getGithubSyncMetadata = async () => {
  try {
    const docSnap = await getDoc(githubSyncDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Initialize with default metadata
      const defaultMetadata = {
        lastSyncTime: null,
        lastSyncSuccess: null,
        syncErrors: [],
        syncedProjects: {},
        isAutoSyncEnabled: false,
        syncIntervalId: null
      };
      await setDoc(githubSyncDocRef, defaultMetadata);
      return defaultMetadata;
    }
  } catch (error) {
    console.error('Error getting GitHub sync metadata:', error);
    throw error;
  }
};

/**
 * Update GitHub sync metadata
 */
export const updateGithubSyncMetadata = async (metadata) => {
  try {
    await updateDoc(githubSyncDocRef, {
      ...metadata,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating GitHub sync metadata:', error);
    throw error;
  }
};

/**
 * Smart sync GitHub repository descriptions with Firestore
 * This function respects user edits and only syncs when appropriate
 * RULE: User edits are NEVER overwritten
 */
export const syncGithubDescriptions = async (username = 'DevRanbir') => {
  try {
    console.log('🔄 Starting smart GitHub description sync...');
    
    // Get current projects from Firestore first
    const projectsData = await getProjectsData();
    const currentProjects = projectsData.projects || [];
    
    // Filter GitHub projects only
    const githubProjects = currentProjects.filter(project => project.isFromGitHub);
    
    console.log(`📊 Current state: ${githubProjects.length} GitHub projects in database`);
    
    // Check if we need to fetch from GitHub
    const userEditedProjects = githubProjects.filter(p => p.userEdited === true);
    const nonUserEditedProjects = githubProjects.filter(p => p.userEdited !== true);
    
    console.log(`🔒 ${userEditedProjects.length} projects are user-edited (will be preserved)`);
    console.log(`📝 ${nonUserEditedProjects.length} projects can be synced from GitHub`);
    
    // Only fetch from GitHub if we have projects to sync OR if we have no projects yet
    let latestRepos = [];
    let shouldFetchFromGitHub = nonUserEditedProjects.length > 0;
    
    // Also check if we might have new repositories (do a lightweight check first)
    if (!shouldFetchFromGitHub && githubProjects.length === 0) {
      console.log('📡 No GitHub projects in database, fetching to check for new repositories...');
      shouldFetchFromGitHub = true;
    }
    
    if (shouldFetchFromGitHub) {
      console.log('📡 Fetching latest repository data from GitHub...');
      // Import GitHub service
      const { default: githubRepoService } = await import('../services/githubRepoService');
      
      latestRepos = await githubRepoService.getRepositoriesAsProjects(username, {
        excludeForks: true,
        excludePrivate: false
      });
      console.log(`📡 Found ${latestRepos.length} repositories on GitHub`);
    } else {
      console.log('ℹ️ Skipping GitHub fetch - all projects are user-edited');
      return {
        success: true,
        updatedCount: 0,
        addedCount: 0,
        totalChecked: githubProjects.length,
        totalRepos: 0,
        errors: [],
        message: `No sync needed - all ${githubProjects.length} GitHub projects are user-edited`
      };
    }
    
    let updatedCount = 0;
    let addedCount = 0;
    const updatedProjects = [...currentProjects];
    const syncErrors = [];
    const syncedProjectsMetadata = {};
    
    // First, add any new GitHub repos that aren't in the database
    for (const latestRepo of latestRepos) {
      const existingProject = currentProjects.find(p => 
        p.isFromGitHub && (
          p.name === latestRepo.name || 
          p.id === latestRepo.id ||
          p.repoUrl === latestRepo.repoUrl
        )
      );
      
      if (!existingProject) {
        console.log(`➕ Adding new GitHub project: ${latestRepo.name}`);
        updatedProjects.push({
          ...latestRepo,
          lastGithubSync: new Date().toISOString(),
          userEdited: false // Flag to track if user has edited this project
        });
        addedCount++;
        
        syncedProjectsMetadata[latestRepo.name] = {
          lastSyncTime: new Date().toISOString(),
          githubUpdatedAt: latestRepo.githubData?.updated_at,
          action: 'added',
          descriptionSynced: true
        };
      }
    }
    
    // Then, sync existing GitHub projects intelligently
    for (const githubProject of githubProjects) {
      try {
        // Find corresponding repo in latest GitHub data
        const latestRepo = latestRepos.find(repo => 
          repo.name === githubProject.name || 
          repo.id === githubProject.id ||
          repo.repoUrl === githubProject.repoUrl
        );
        
        if (latestRepo) {
          const currentDescription = githubProject.description || '';
          const latestDescription = latestRepo.description || '';
          const hasUserEdit = githubProject.userEdited === true;
          
          // Determine if we should sync from GitHub
          let shouldSync = false;
          let syncReason = '';
          
          // RULE: If user has edited, NEVER update from GitHub (even with force sync)
          if (hasUserEdit) {
            console.log(`🔒 ${githubProject.name}: User edit preserved (never overwritten)`);
            shouldSync = false;
            syncReason = 'user edit preserved';
          } else {
            // RULE: If no user edit, update from GitHub if description changed
            if (currentDescription !== latestDescription) {
              shouldSync = true;
              syncReason = 'GitHub description changed';
            }
          }
          
          if (shouldSync) {
            console.log(`📝 Syncing ${githubProject.name}: ${syncReason}`);
            console.log(`   Old: "${currentDescription}"`);
            console.log(`   New: "${latestDescription}"`);
            
            // Find and update the project in the array
            const projectIndex = updatedProjects.findIndex(p => 
              (p.isFromGitHub && p.name === githubProject.name) ||
              p.id === githubProject.id
            );
            
            if (projectIndex !== -1) {
              updatedProjects[projectIndex] = {
                ...updatedProjects[projectIndex],
                description: latestDescription,
                lastGithubSync: new Date().toISOString(),
                userEdited: false, // Reset user edit flag when syncing from GitHub
                lastUserEdit: null, // Clear user edit timestamp
                githubData: {
                  ...updatedProjects[projectIndex].githubData,
                  updated_at: latestRepo.githubData?.updated_at || new Date().toISOString()
                }
              };
              updatedCount++;
            }
          }
          
          // Store sync metadata for this project
          syncedProjectsMetadata[githubProject.name] = {
            lastSyncTime: new Date().toISOString(),
            githubUpdatedAt: latestRepo.githubData?.updated_at,
            userEdited: hasUserEdit,
            shouldSync: shouldSync,
            syncReason: syncReason,
            descriptionSynced: shouldSync,
            action: shouldSync ? 'synced' : 'preserved'
          };
          
        } else {
          console.warn(`⚠️ GitHub project ${githubProject.name} not found in latest GitHub data`);
          syncErrors.push(`Project ${githubProject.name} not found in GitHub`);
        }
        
      } catch (projectError) {
        console.error(`❌ Error syncing project ${githubProject.name}:`, projectError);
        syncErrors.push(`Error syncing ${githubProject.name}: ${projectError.message}`);
      }
    }
    
    // Update Firestore if any changes were made
    if (updatedCount > 0 || addedCount > 0) {
      await updateProjects(updatedProjects);
      console.log(`✅ Updated ${updatedCount} and added ${addedCount} projects in Firestore`);
    } else {
      console.log('ℹ️ No changes needed - all projects are up to date or user-edited');
    }
    
    // Update sync metadata
    await updateGithubSyncMetadata({
      lastSyncTime: new Date().toISOString(),
      lastSyncSuccess: syncErrors.length === 0,
      syncErrors: syncErrors,
      syncedProjects: syncedProjectsMetadata
    });
    
    return {
      success: true,
      updatedCount,
      addedCount,
      totalChecked: githubProjects.length,
      totalRepos: latestRepos.length,
      errors: syncErrors,
      message: `Smart sync completed. Updated ${updatedCount}, added ${addedCount} out of ${latestRepos.length} GitHub repos.`
    };
    
  } catch (error) {
    console.error('❌ GitHub sync failed:', error);
    
    // Update metadata with error
    try {
      await updateGithubSyncMetadata({
        lastSyncTime: new Date().toISOString(),
        lastSyncSuccess: false,
        syncErrors: [error.message]
      });
    } catch (metadataError) {
      console.error('Error updating sync metadata:', metadataError);
    }
    
    return {
      success: false,
      error: error.message,
      message: `Sync failed: ${error.message}`
    };
  }
};

/**
 * Mark a project as user-edited to prevent GitHub sync overwriting
 */
export const markProjectAsUserEdited = async (projectId, description) => {
  try {
    console.log(`🔒 Marking project ${projectId} as user-edited`);
    
    const projectsData = await getProjectsData();
    const projects = projectsData.projects || [];
    
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      projects[projectIndex] = {
        ...projects[projectIndex],
        description: description,
        userEdited: true,
        lastUserEdit: new Date().toISOString()
      };
      
      await updateProjects(projects);
      console.log(`✅ Project ${projectId} marked as user-edited`);
      
      return { success: true };
    } else {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
  } catch (error) {
    console.error('❌ Error marking project as user-edited:', error);
    throw error;
  }
};



/**
 * Start automatic GitHub description sync
 * This will run the sync periodically based on GITHUB_SYNC_INTERVAL
 */
export const startGithubAutoSync = async (username = 'DevRanbir') => {
  try {
    console.log('🚀 Starting automatic GitHub description sync...');
    
    // Stop any existing interval first
    await stopGithubAutoSync();
    
    // Run initial sync
    await syncGithubDescriptions(username);
    
    // Set up periodic sync
    const intervalId = setInterval(async () => {
      try {
        console.log('⏰ Running scheduled GitHub description sync...');
        await syncGithubDescriptions(username);
      } catch (error) {
        console.error('❌ Scheduled sync failed:', error);
      }
    }, GITHUB_SYNC_INTERVAL);
    
    // Update metadata with interval info
    await updateGithubSyncMetadata({
      isAutoSyncEnabled: true,
      autoSyncStartedAt: new Date().toISOString(),
      syncInterval: GITHUB_SYNC_INTERVAL
    });
    
    console.log(`✅ Auto-sync started. Will run every ${GITHUB_SYNC_INTERVAL / 1000 / 60} minutes.`);
    
    // Store interval ID globally (in a real app, you'd want to manage this better)
    if (typeof window !== 'undefined') {
      window.githubSyncIntervalId = intervalId;
    }
    
    return {
      success: true,
      intervalId,
      message: `Auto-sync started. Interval: ${GITHUB_SYNC_INTERVAL / 1000 / 60} minutes.`
    };
    
  } catch (error) {
    console.error('❌ Failed to start auto-sync:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Stop automatic GitHub description sync
 */
export const stopGithubAutoSync = async () => {
  try {
    // Clear interval if it exists
    if (typeof window !== 'undefined' && window.githubSyncIntervalId) {
      clearInterval(window.githubSyncIntervalId);
      window.githubSyncIntervalId = null;
    }
    
    // Update metadata
    await updateGithubSyncMetadata({
      isAutoSyncEnabled: false,
      autoSyncStoppedAt: new Date().toISOString()
    });
    
    console.log('🛑 Auto-sync stopped.');
    
    return {
      success: true,
      message: 'Auto-sync stopped successfully.'
    };
    
  } catch (error) {
    console.error('❌ Failed to stop auto-sync:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get GitHub sync status and statistics
 */
export const getGithubSyncStatus = async () => {
  try {
    const metadata = await getGithubSyncMetadata();
    const projectsData = await getProjectsData();
    const githubProjects = (projectsData.projects || []).filter(p => p.isFromGitHub);
    
    return {
      isAutoSyncEnabled: metadata.isAutoSyncEnabled || false,
      lastSyncTime: metadata.lastSyncTime,
      lastSyncSuccess: metadata.lastSyncSuccess,
      syncErrors: metadata.syncErrors || [],
      totalGithubProjects: githubProjects.length,
      syncedProjects: metadata.syncedProjects || {},
      syncInterval: GITHUB_SYNC_INTERVAL,
      nextSyncTime: metadata.lastSyncTime ? 
        new Date(new Date(metadata.lastSyncTime).getTime() + GITHUB_SYNC_INTERVAL).toISOString() : 
        null
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    throw error;
  }
};

/**
 * Manual sync trigger with custom options
 */
export const triggerManualGithubSync = async (options = {}) => {
  const {
    username = 'DevRanbir'
  } = options;
  
  console.log('🔧 Manual GitHub sync triggered for username:', username);
  
  // User edits are always preserved - no forceSync option
  return await syncGithubDescriptions(username, false);
};

/**
 * Initialize GitHub sync on app startup
 * Call this function when your app starts to begin automatic syncing
 */
export const initializeGithubSync = async (username = 'DevRanbir', autoStart = true) => {
  try {
    console.log('🔄 Initializing GitHub sync system...');
    
    // Get current sync status
    const status = await getGithubSyncStatus();
    
    if (autoStart && !status.isAutoSyncEnabled) {
      // Start auto-sync if not already running
      const result = await startGithubAutoSync(username);
      console.log('✅ GitHub sync initialized and auto-sync started');
      return result;
    } else if (status.isAutoSyncEnabled) {
      console.log('ℹ️ Auto-sync already running');
      return {
        success: true,
        message: 'Auto-sync already running',
        status
      };
    } else {
      console.log('ℹ️ GitHub sync initialized but auto-sync not started (autoStart=false)');
      return {
        success: true,
        message: 'Sync initialized without auto-start',
        status
      };
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize GitHub sync:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test function to verify GitHub sync functionality
 * Use this to test the sync system
 */
export const testGithubSync = async (username = 'DevRanbir') => {
  try {
    console.log('🧪 Testing GitHub sync functionality...');
    
    // Test 1: Check GitHub API connectivity
    console.log('📡 Testing GitHub API connectivity...');
    const { default: githubRepoService } = await import('../services/githubRepoService');
    // eslint-disable-next-line
    const testRepos = await githubRepoService.getUserRepositories(username, { per_page: 1 });
    console.log('✅ GitHub API connectivity: OK');
    
    // Test 2: Check Firestore connectivity
    console.log('💾 Testing Firestore connectivity...');
    // eslint-disable-next-line
    const projectsData = await getProjectsData();
    console.log('✅ Firestore connectivity: OK');
    
    // Test 3: Run a sync test
    console.log('🔄 Running sync test...');
    const syncResult = await syncGithubDescriptions(username);
    console.log('✅ Sync test completed:', syncResult);
    
    // Test 4: Check sync status
    console.log('📊 Checking sync status...');
    const status = await getGithubSyncStatus();
    console.log('✅ Sync status retrieved:', status);
    
    return {
      success: true,
      tests: {
        githubAPI: true,
        firestore: true,
        sync: syncResult.success,
        status: true
      },
      syncResult,
      status,
      message: 'All tests passed successfully!'
    };
    
  } catch (error) {
    console.error('❌ GitHub sync test failed:', error);
    return {
      success: false,
      error: error.message,
      message: `Test failed: ${error.message}`
    };
  }
};

// ====================== PROJECT MANAGEMENT UTILITIES ======================

/**
 * Reset user edit flags for all GitHub projects
 * This will allow all projects to be synced from GitHub again
 */
export const resetAllUserEditFlags = async () => {
  try {
    console.log('🔄 Resetting all user edit flags...');
    
    const projectsData = await getProjectsData();
    const projects = projectsData.projects || [];
    
    const resetProjects = projects.map(project => {
      if (project.isFromGitHub) {
        return {
          ...project,
          userEdited: false,
          lastUserEdit: null
        };
      }
      return project;
    });
    
    await updateDoc(projectsDocRef, {
      projects: resetProjects,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('✅ All user edit flags reset');
    return { success: true, message: 'All user edit flags reset successfully' };
    
  } catch (error) {
    console.error('❌ Error resetting user edit flags:', error);
    throw error;
  }
};

/**
 * Get project sync status for debugging
 */
export const getProjectSyncStatus = async () => {
  try {
    const projectsData = await getProjectsData();
    const projects = projectsData.projects || [];
    const githubProjects = projects.filter(p => p.isFromGitHub);
    
    const status = githubProjects.map(project => ({
      name: project.name,
      id: project.id,
      description: project.description,
      userEdited: project.userEdited || false,
      lastUserEdit: project.lastUserEdit || null,
      lastGithubSync: project.lastGithubSync || null,
      repoUrl: project.repoUrl
    }));
    
    return {
      total: githubProjects.length,
      userEdited: status.filter(p => p.userEdited).length,
      notEdited: status.filter(p => !p.userEdited).length,
      projects: status
    };
    
  } catch (error) {
    console.error('❌ Error getting project sync status:', error);
    throw error;
  }
};

/**
 * Force sync a specific project from GitHub (ignoring user edits)
 */
export const forceSyncProject = async (projectId, username = 'DevRanbir') => {
  try {
    console.log(`🔧 Force syncing project ${projectId}...`);
    
    // Import GitHub service
    const { default: githubRepoService } = await import('../services/githubRepoService');
    
    // Get current projects
    const projectsData = await getProjectsData();
    const projects = projectsData.projects || [];
    
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const project = projects[projectIndex];
    
    if (!project.isFromGitHub) {
      throw new Error(`Project ${project.name} is not a GitHub project`);
    }
    
    // Get latest data from GitHub
    const latestRepos = await githubRepoService.getRepositoriesAsProjects(username, {
      excludeForks: true,
      excludePrivate: false
    });
    
    const latestRepo = latestRepos.find(repo => 
      repo.name === project.name || 
      repo.id === project.id ||
      repo.repoUrl === project.repoUrl
    );
    
    if (!latestRepo) {
      throw new Error(`GitHub repository for ${project.name} not found`);
    }
    
    // Update the project with latest GitHub data
    projects[projectIndex] = {
      ...project,
      description: latestRepo.description,
      lastGithubSync: new Date().toISOString(),
      userEdited: false,
      lastUserEdit: null,
      githubData: {
        ...project.githubData,
        ...latestRepo.githubData,
        updated_at: latestRepo.githubData?.updated_at || new Date().toISOString()
      }
    };
    
    await updateDoc(projectsDocRef, {
      projects: projects,
      lastUpdated: new Date().toISOString()
    });
    
    console.log(`✅ Project ${project.name} force synced from GitHub`);
    
    return {
      success: true,
      project: projects[projectIndex],
      message: `Project ${project.name} successfully synced from GitHub`
    };
    
  } catch (error) {
    console.error('❌ Error force syncing project:', error);
    throw error;
  }
};

/**
 * Remove a project from the database (it will be re-added from GitHub on next sync)
 */
export const removeProjectFromDatabase = async (projectId) => {
  try {
    console.log(`🗑️ Removing project ${projectId} from database...`);
    
    const projectsData = await getProjectsData();
    const projects = projectsData.projects || [];
    
    const filteredProjects = projects.filter(p => p.id !== projectId);
    
    if (filteredProjects.length === projects.length) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    await updateDoc(projectsDocRef, {
      projects: filteredProjects,
      lastUpdated: new Date().toISOString()
    });
    
    console.log(`✅ Project removed from database. It will be re-added from GitHub on next sync.`);
    
    return {
      success: true,
      message: 'Project removed successfully. It will be re-synced from GitHub.'
    };
    
  } catch (error) {
    console.error('❌ Error removing project:', error);
    throw error;
  }
};

