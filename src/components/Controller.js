import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css'; // Reusing Homepage.css

const Controller = () => {
  const navigate = useNavigate();

  const [commandInput, setCommandInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commandMessage, setCommandMessage] = useState('');
  const [showCommandMessage, setShowCommandMessage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [passwordError, setPasswordError] = useState('');

  // Simple dropdown items for navigation
  const dropdownItems = [
    { id: 1, name: 'Home', icon: '🏠', type: 'folder' },
    { id: 2, name: 'Documents', icon: '📁', type: 'folder' },
    { id: 3, name: 'Projects', icon: '📽️', type: 'folder' },
    { id: 4, name: 'About', icon: '👤', type: 'action' },
    { id: 5, name: 'Contact', icon: '📫', type: 'action' },
  ];

  const handleInputChange = (e) => {
    setCommandInput(e.target.value);
    setIsDropdownOpen(e.target.value.length > 0);
  };

  const handleInputFocus = () => {
    if (isAuthenticated) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsDropdownOpen(false), 150);
  };

  const handleItemClick = (item) => {
    setCommandInput(item.name);
    
    // Handle navigation based on the selected item
    if (item.name === 'Home') {
      navigate('/');
    } else if (item.name === 'Documents') {
      navigate('/documents');
    } else if (item.name === 'Projects') {
      navigate('/projects');
    } else if (item.name === 'About') {
      navigate('/about');
    } else if (item.name === 'Contact') {
      navigate('/contacts');
    }
    
    setIsDropdownOpen(false);
  };

  const handleCommandSubmit = (e) => {
    if (e.key === 'Enter' && isAuthenticated) {
      const command = commandInput.toLowerCase().trim();
      
      // Navigation commands
      if (command === 'home' || command === 'h') {
        navigate('/');
      } else if (command === 'documents' || command === 'd') {
        navigate('/documents');
      } else if (command === 'projects' || command === 'p') {
        navigate('/projects');
      } else if (command === 'about' || command === 'a') {
        navigate('/about');
      } else if (command === 'contacts' || command === 'c') {
        navigate('/contacts');
      } else if (command === 'exit') {
        setIsAuthenticated(false);
        setShowPasswordModal(true);
        showMessage("Exited controller mode");
      } else {
        showMessage("Controller mode - Command functionality coming soon!");
      }

      setCommandInput('');
      setIsDropdownOpen(false);
    }
  };

  // Authentication
  const validatePassword = (e) => {
    if (e) e.preventDefault();
    const correctPassword = 'controller123'; // Admin password
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      setIsDropdownOpen(true);
      showMessage("Controller mode activated. Welcome, Admin!");
    } else {
      setPasswordError('Invalid controller password. Access denied.');
    }
  };

  // Show message function
  const showMessage = (message) => {
    setCommandMessage(message);
    setShowCommandMessage(true);
    setTimeout(() => {
      setShowCommandMessage(false);
    }, 4000);
  };

  // Clock update effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      document.documentElement.style.setProperty('--timer-hours', `"${hours}"`);
      document.documentElement.style.setProperty('--timer-minutes', `"${minutes}"`);
      document.documentElement.style.setProperty('--timer-seconds', `"${seconds}"`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle "/" key press to focus command line
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && isAuthenticated) {
        event.preventDefault();
        const commandInput = document.querySelector('.command-input');
        if (commandInput) {
          commandInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="homepage">
        <div className="spline-background">
          {/* Password Modal */}
          {showPasswordModal && (
            <div className="password-modal-overlay">
              <div className="password-modal glass-panel">
                <h3>🔒 Controller Access</h3>
                <p>Enter the controller password to access admin functions.</p>
                
                {passwordError && <div className="password-error">{passwordError}</div>}
                
                <div className="password-input-wrapper">
                  <form autoComplete="off" onSubmit={validatePassword}>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Controller password"
                      className="password-input"
                      autoComplete="new-password"
                      autoFocus
                    />
                  </form>
                </div>
                
                <div className="password-modal-buttons">
                  <button 
                    className="password-submit-btn" 
                    onClick={validatePassword}
                  >
                    Access Controller
                  </button>
                  <button 
                    className="password-cancel-btn" 
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Digital Clock */}
          <div className="digital-clock-container">
            <div className="clock-container">
              <div className="clock-col">
                <p className="clock-hours clock-timer"></p>
                <p className="clock-label">Hours</p>
              </div>
              <div className="clock-col">
                <p className="clock-minutes clock-timer"></p>
                <p className="clock-label">Minutes</p>
              </div>
              <div className="clock-col">
                <p className="clock-seconds clock-timer"></p>
                <p className="clock-label">Seconds</p>
              </div>
            </div>
            <div className="current-date">
              <span className="date-display">{currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} IST</span>
            </div>
          </div>

          {/* Animated Bottom Pattern */}
          <div className="bottom-pattern">
            <div className="wave-container">
              <div className="wave wave-1"></div>
              <div className="wave wave-2"></div>
              <div className="wave wave-3"></div>
            </div>
            <div className="geometric-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="spline-background">
        {/* Command Line Interface */}
        <div className="command-line-container">
          <div className="glass-panel">
            <form id="command-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <div className="command-input-wrapper">
                <span className="prompt-symbol">$</span>
                <input
                  type="text"
                  className="command-input"
                  placeholder="Controller mode - Type a command or search..."
                  value={commandInput}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleCommandSubmit}
                  autoComplete="off"
                />
                <span className={`dropdown-indicator ${isDropdownOpen ? 'open' : 'closed'}`}>
                  {isDropdownOpen ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  )}
                </span>
              </div>
            </form>
            
            {isDropdownOpen && (
              <div className="dropdown-panel">
                <div className="explorer-grid">
                  {dropdownItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="explorer-item"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="item-icon">{item.icon}</div>
                      <div className="item-name">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Command Message */}
        {showCommandMessage && (
          <div className="command-message">
            {commandMessage}
          </div>
        )}

        {/* Digital Clock */}
        <div className="digital-clock-container">
          <div className="clock-container">
            <div className="clock-col">
              <p className="clock-hours clock-timer"></p>
              <p className="clock-label">Hours</p>
            </div>
            <div className="clock-col">
              <p className="clock-minutes clock-timer"></p>
              <p className="clock-label">Minutes</p>
            </div>
            <div className="clock-col">
              <p className="clock-seconds clock-timer"></p>
              <p className="clock-label">Seconds</p>
            </div>
          </div>
          <div className="current-date">
            <span className="date-display">{currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} IST</span>
          </div>
        </div>

        {/* Animated Bottom Pattern */}
        <div className="bottom-pattern">
          <div className="wave-container">
            <div className="wave wave-1"></div>
            <div className="wave wave-2"></div>
            <div className="wave wave-3"></div>
          </div>
          <div className="geometric-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controller;
