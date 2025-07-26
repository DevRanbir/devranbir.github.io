import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import Documents from './components/Documents';
import Projects from './components/Projects';
import About from './components/About';
import Contacts from './components/Contacts';
import Controller from './components/Controller';
import './App.css';

// Import chat cleanup utility (automatically starts cleanup)
import './utils/chatCleanup';

// Import GitHub sync service
import { initializeGitHubSync } from './services/githubSyncService';

function App() {
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  // Check if device is mobile and fullscreen status
  useEffect(() => {
    const checkMobileAndFullscreen = () => {
      const isMobile = window.innerWidth <= 768;
      const isCurrentlyFullscreen = document.fullscreenElement !== null || 
                                    document.webkitFullscreenElement !== null ||
                                    document.mozFullScreenElement !== null ||
                                    document.msFullscreenElement !== null;
      
      if (isMobile && !isCurrentlyFullscreen) {
        setShowFullscreenPrompt(true);
      } else {
        setShowFullscreenPrompt(false);
      }
    };

    // Check on load
    checkMobileAndFullscreen();

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      checkMobileAndFullscreen();
    };

    // Listen for window resize
    const handleResize = () => {
      checkMobileAndFullscreen();
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to enter fullscreen
  const enterFullscreen = () => {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  // Function to dismiss prompt (continue without fullscreen)
  const dismissPrompt = () => {
    setShowFullscreenPrompt(false);
  };
  useEffect(() => {
    // Initialize GitHub sync service when app starts
    const initializeSync = async () => {
      try {
        console.log('🚀 Initializing GitHub sync service...');
        const result = await initializeGitHubSync('DevRanbir', true);
        
        if (result.success) {
        } else {
          console.warn('⚠️ GitHub sync service initialization failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Failed to initialize GitHub sync service:', error);
      }
    };

    initializeSync();
  }, []);

  // Global error handler for Three.js NaN errors and browser extension errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      const errorMessage = event.error?.message || event.message || '';
      
      // Suppress Three.js BufferGeometry NaN errors
      if (errorMessage.includes('THREE.BufferGeometry.computeBoundingSphere') ||
          errorMessage.includes('Computed radius is NaN') ||
          errorMessage.includes('MeshLineGeometry') ||
          (errorMessage.includes('position') && errorMessage.includes('NaN'))) {
        
        console.warn('🎭 Three.js NaN error suppressed (this is handled gracefully):', errorMessage);
        event.preventDefault();
        return false;
      }

      // Suppress Chrome extension runtime errors
      if (errorMessage.includes('runtime.lastError') ||
          errorMessage.includes('Could not establish connection') ||
          errorMessage.includes('Receiving end does not exist') ||
          errorMessage.includes('Extension context invalidated') ||
          errorMessage.includes('Unchecked runtime.lastError')) {
        
        console.warn('🔌 Browser extension error suppressed (this is harmless):', errorMessage);
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event) => {
      const errorMessage = event.reason?.message || event.reason || '';
      
      if (errorMessage.includes('THREE.BufferGeometry') || 
          (errorMessage.includes('NaN') && errorMessage.includes('position'))) {
        console.warn('🎭 Three.js promise rejection suppressed:', errorMessage);
        event.preventDefault();
      }

      // Suppress Chrome extension promise rejections
      if (errorMessage.includes('runtime.lastError') ||
          errorMessage.includes('Could not establish connection') ||
          errorMessage.includes('Extension context invalidated') ||
          errorMessage.includes('Unchecked runtime.lastError')) {
        console.warn('🔌 Browser extension promise rejection suppressed:', errorMessage);
        event.preventDefault();
      }
    };

    // Add global error listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="App">
      {/* Fullscreen Prompt for Mobile */}
      {showFullscreenPrompt && (
        <div className="fullscreen-prompt-overlay">
          <div className="fullscreen-prompt-modal">
            <div className="fullscreen-prompt-icon">📱</div>
            <h3>Better Experience Awaits</h3>
            <p>
              For the best experience on mobile, we recommend using fullscreen mode. 
              This will give you more space to explore and interact with the content.
            </p>
            <div className="fullscreen-prompt-buttons">
              <button 
                onClick={enterFullscreen}
                className="fullscreen-enter-btn"
              >
                Enter Fullscreen
              </button>
              <button 
                onClick={dismissPrompt}
                className="fullscreen-dismiss-btn"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/controller" element={<Controller />} />
          <Route path="/god" element={<Controller />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
