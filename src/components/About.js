import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css'; // Reusing Homepage styles
import './About.css'; // New styles for About-specific content

const About = () => {
  const navigate = useNavigate();

  const [commandInput, setCommandInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [commandMessage, setCommandMessage] = useState('');
  const [showCommandMessage, setShowCommandMessage] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dropdown items for navigation
  const dropdownItems = [
    { id: 1, name: 'Home', icon: '🏠', type: 'action' },
    { id: 2, name: 'Documents', icon: '📁', type: 'folder' },
    { id: 3, name: 'Projects', icon: '📽️', type: 'folder' },
    { id: 4, name: 'Contact', icon: '📫', type: 'action' },
  ];
  
  // Command templates for edit mode
  const commandTemplates = [
    { id: 'exit', template: 'exit', description: 'Exit edit mode' },
  ];
  
  const handleInputChange = (e) => {
    setCommandInput(e.target.value);
    setIsDropdownOpen(e.target.value.length > 0);
  };
  
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };
  
  const handleInputBlur = () => {
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => setIsDropdownOpen(false), 150);
  };
  
  const handleItemClick = (item) => {
    if (editMode && typeof item === 'object' && 'template' in item) {
      // This is a command template
      setCommandInput(item.template);
    } else {
      // This is a regular folder/file item
      setCommandInput(item.name);
      console.log(`Selected: ${item.name}`);
      
      // Handle navigation based on the selected item
      if (item.name === 'Home') {
        navigate('/');
      } else if (item.name === 'Documents') {
        navigate('/documents');
      } else if (item.name === 'Projects') {
        navigate('/projects');
      }
    }
    // Keep dropdown open for command templates in edit mode
    if (!(editMode && typeof item === 'object' && 'template' in item)) {
      setIsDropdownOpen(false);
    }
  };
  
  const handleCommandSubmit = (e) => {
    if (e.key === 'Enter') {
      const command = commandInput.toLowerCase().trim();
      
      // Navigation commands (available in both edit and normal mode)
      if (command === 'home') {
        setCommandInput('');
        setIsDropdownOpen(false);
        navigate('/');
        return;
      } else if (command === 'documents') {
        setCommandInput('');
        setIsDropdownOpen(false);
        navigate('/documents');
        return;
      } else if (command === 'projects') {
        setCommandInput('');
        setIsDropdownOpen(false);
        navigate('/projects');
        return;
      }
      
      if (command === 'edit') {
        setShowPasswordModal(true);
      } else if (editMode) {
        // Exit edit mode command
        if (command === 'exit') {
          handleExitEditMode();
        }
      }
      
      // Clear command input after processing
      setCommandInput('');
      setIsDropdownOpen(false);
    }
  };
  
  const validatePassword = (e) => {
    if (e) e.preventDefault();
    const correctPassword = 'ranbir195';
    if (passwordInput === correctPassword) {
      setEditMode(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      setCommandInput('');
      setIsDropdownOpen(true);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };
  
  const handleExitEditMode = () => {
    setEditMode(false);
    showMessage("Exited edit mode.");
  };

  // Show a temporary command result message
  const showMessage = (message) => {
    setCommandMessage(message);
    setShowCommandMessage(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowCommandMessage(false);
    }, 3000);
  };

  // Effect for loading Spline viewer script
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js';
    script.onerror = () => {
      console.warn('Failed to load Spline viewer script, falling back to basic version');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

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
  
  return (
    <div className="homepage">
      {/* Spline 3D Background */}
      <div className="spline-background">
        {/* Command Line Interface */}
        <div className="command-line-container">
          <div className="glass-panel">
            <form id="command-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <div className="command-input-wrapper">
                <span className="prompt-symbol">{editMode ? '🔓' : '$'}</span>
                <input
                  type="text"
                  className="command-input"
                  placeholder={editMode ? "Type a command or click a template below..." : "Type a command or search..."}
                  value={commandInput}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleCommandSubmit}
                  autoComplete="off"
                />
              </div>
            </form>
            
            {isDropdownOpen && (
              <div className="dropdown-panel">
                <div className="explorer-grid">
                  {editMode ? 
                    commandTemplates.map((cmd) => (
                      <div 
                        key={cmd.id} 
                        className="explorer-item command-template"
                        onClick={() => handleItemClick(cmd)}
                      >
                        <div className="item-icon">🚪</div>
                        <div className="item-name">{cmd.id}</div>
                        <div className="item-description">{cmd.description}</div>
                      </div>
                    ))
                    :
                    dropdownItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="explorer-item"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="item-icon">{item.icon}</div>
                        <div className="item-name">{item.name}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="top-area-shade">
          <spline-viewer 
            url="https://prod.spline.design/G73ETPu1BKxE3nue/scene.splinecode"
            onError={() => console.warn('Spline scene failed to load')}
          ></spline-viewer>
          <div className="spline-cover"></div>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="password-modal-overlay">
            <div className="password-modal glass-panel">
              <h3>Enter Password</h3>
              <p>Enter the password to access edit mode.</p>
              
              {passwordError && <div className="password-error">{passwordError}</div>}
              
              <div className="password-input-wrapper">
                <form autoComplete="off" onSubmit={(e) => {
                  e.preventDefault();
                  validatePassword();
                }}>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="password-input"
                    autoComplete="new-password"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        validatePassword();
                      }
                    }}
                  />
                </form>
              </div>
              
              <div className="password-modal-buttons">
                <button 
                  className="password-submit-btn" 
                  onClick={validatePassword}
                >
                  Submit
                </button>
                <button 
                  className="password-cancel-btn" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput('');
                    setPasswordError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About Content Section - Replaces the author section */}
        <div className="about-content-section">
          <div className="about-container">
            <div className="about-header">
              <h1>About This Portfolio</h1>
              <div className="about-divider"></div>
            </div>
            
            <div className="about-main-content">
              <div className="about-section">
                <h2>🎯 Mission</h2>
                <p>This portfolio showcases modern web development techniques and creative design principles. Built with cutting-edge technologies to demonstrate proficiency in full-stack development and user experience design.</p>
              </div>

              <div className="about-section">
                <h2>🚀 Technologies Used</h2>
                <div className="tech-grid">
                  <div className="tech-item">
                    <span className="tech-icon">⚛️</span>
                    <span className="tech-name">React</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🎨</span>
                    <span className="tech-name">CSS3</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">📱</span>
                    <span className="tech-name">Responsive Design</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🌊</span>
                    <span className="tech-name">CSS Animations</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🎮</span>
                    <span className="tech-name">Spline 3D</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">💻</span>
                    <span className="tech-name">Command Line Interface</span>
                  </div>
                </div>
              </div>

              <div className="about-section">
                <h2>✨ Features</h2>
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">🔍</span>
                    <div className="feature-content">
                      <h3>Interactive Command Line</h3>
                      <p>Navigate through the portfolio using a command-line interface with autocomplete and suggestions.</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🌐</span>
                    <div className="feature-content">
                      <h3>3D Background</h3>
                      <p>Immersive Spline 3D scenes provide a modern and engaging visual experience.</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎭</span>
                    <div className="feature-content">
                      <h3>Animated Elements</h3>
                      <p>Smooth CSS animations and transitions create a fluid user experience.</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📱</span>
                    <div className="feature-content">
                      <h3>Responsive Design</h3>
                      <p>Optimized for all devices with mobile-first approach and adaptive layouts.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="about-section">
                <h2>🎨 Design Philosophy</h2>
                <p>This portfolio blends modern minimalism with interactive elements, creating an engaging yet professional presentation. The design emphasizes clean typography, thoughtful spacing, and intuitive navigation while showcasing technical capabilities through innovative features like the command-line interface and 3D elements.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Command Message */}
        {showCommandMessage && (
          <div className="command-message">
            {commandMessage}
          </div>
        )}

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
        
        {/* Edit Mode Indicator */}
        {editMode && (
          <div className="edit-mode-indicator">
            <button className="exit-edit-mode-btn" onClick={handleExitEditMode}>
              Exit Edit Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
