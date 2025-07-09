import React, { useEffect } from 'react';
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

// Import GitHub sync test utilities (development only)
if (process.env.NODE_ENV === 'development') {
  import('./utils/githubSyncTests');
  import('./utils/smartCachingTests');
}

function App() {
  useEffect(() => {
    // Initialize GitHub sync service when app starts
    const initializeSync = async () => {
      try {
        console.log('🚀 Initializing GitHub sync service...');
        const result = await initializeGitHubSync('DevRanbir', true);
        
        if (result.success) {
          console.log('✅ GitHub sync service initialized successfully');
        } else {
          console.warn('⚠️ GitHub sync service initialization failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Failed to initialize GitHub sync service:', error);
      }
    };

    initializeSync();
  }, []);

  return (
    <div className="App">
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
