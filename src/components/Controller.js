import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css'; // Reusing Homepage.css
import './Controller.css'; // New styles for Controller component

import { 
  getHomepageData, 
  updateSocialLinks, 
  updateAuthorDescription, 
  updateAuthorSkills,
  subscribeToHomepageData,
  initializeHomepageData
} from '../firebase/firestoreService';

const Controller = () => {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [commandMessage, setCommandMessage] = useState('');
  const [showCommandMessage, setShowCommandMessage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Homepage data sync states
  const [socialLinks, setSocialLinks] = useState([]);
  const [authorDescription, setAuthorDescription] = useState('');
  const [authorSkills, setAuthorSkills] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newItemData, setNewItemData] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Navigation links (reusing social links design)
  const navigationLinks = [
    { 
      id: 'home', 
      icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>, 
      path: '/',
      label: 'Home'
    },
    { 
      id: 'documents', 
      icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline></svg>, 
      path: '/documents',
      label: 'Documents'
    },
    { 
      id: 'projects', 
      icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>, 
      path: '/projects',
      label: 'Projects'
    },
    { 
      id: 'about', 
      icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>, 
      path: '/about',
      label: 'About'
    },
    { 
      id: 'contacts', 
      icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>, 
      path: '/contacts',
      label: 'Contacts'
    },
  ];

  const handleNavigationClick = (link) => {
    setActiveSection(link.id);
    showMessage(`Switched to ${link.label} section`);
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

  // Load Homepage data from Firestore
  const loadHomepageData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await getHomepageData();
      
      if (data.socialLinks) {
        const reconstructedLinks = data.socialLinks.map(link => ({
          ...link,
          icon: getDefaultIcon(link.id)
        }));
        setSocialLinks(reconstructedLinks);
      }
      
      if (data.authorDescription) {
        setAuthorDescription(data.authorDescription);
      }
      
      if (data.authorSkills) {
        setAuthorSkills(data.authorSkills);
      }
      
      showMessage('Data loaded from Firestore successfully!');
    } catch (error) {
      console.error('Error loading homepage data:', error);
      setError('Failed to load data from Firestore');
      showMessage('Error loading data from Firestore');
    } finally {
      setLoading(false);
    }
  };

  // Save data to Firestore and dispatch event
  const saveToFirestore = async (updateFunction, data, successMessage) => {
    try {
      setLoading(true);
      await updateFunction(data);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('homepageDataUpdated', { 
        detail: { data, timestamp: new Date().toISOString() } 
      }));
      
      showMessage(successMessage);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      setError('Failed to save data to Firestore');
      showMessage('Error saving data to Firestore');
    } finally {
      setLoading(false);
    }
  };

  // Handle social link editing
  const handleEditSocialLink = (link) => {
    setEditingItem(`social-${link.id}`);
    setEditFormData({
      name: link.id,
      url: link.url
    });
  };

  const handleSaveSocialLink = async () => {
    const updatedLinks = socialLinks.map(link => 
      link.id === editingItem.replace('social-', '') 
        ? { ...link, id: editFormData.name, url: editFormData.url, icon: getDefaultIcon(editFormData.name) }
        : link
    );
    setSocialLinks(updatedLinks);
    await saveToFirestore(updateSocialLinks, updatedLinks, 'Social link updated successfully!');
    setEditingItem(null);
  };

  const handleDeleteSocialLink = async (linkId) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      const updatedLinks = socialLinks.filter(link => link.id !== linkId);
      setSocialLinks(updatedLinks);
      await saveToFirestore(updateSocialLinks, updatedLinks, 'Social link deleted successfully!');
    }
  };

  // Handle author description editing
  const handleEditAuthorDescription = () => {
    setEditingItem('author-description');
    setEditFormData({ description: authorDescription });
  };

  const handleSaveAuthorDescription = async () => {
    setAuthorDescription(editFormData.description);
    await saveToFirestore(updateAuthorDescription, editFormData.description, 'Author description updated successfully!');
    setEditingItem(null);
  };

  // Handle skills editing
  const handleEditSkill = (skill, index) => {
    setEditingItem(`skill-${index}`);
    setEditFormData({ skill });
  };

  const handleSaveSkill = async (index) => {
    const updatedSkills = [...authorSkills];
    updatedSkills[index] = editFormData.skill;
    setAuthorSkills(updatedSkills);
    await saveToFirestore(updateAuthorSkills, updatedSkills, 'Skill updated successfully!');
    setEditingItem(null);
  };

  const handleDeleteSkill = async (index) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      const updatedSkills = authorSkills.filter((_, i) => i !== index);
      setAuthorSkills(updatedSkills);
      await saveToFirestore(updateAuthorSkills, updatedSkills, 'Skill deleted successfully!');
    }
  };

  const handleAddNewSkill = async () => {
    if (newItemData.skill && newItemData.skill.trim()) {
      const updatedSkills = [...authorSkills, newItemData.skill.trim()];
      setAuthorSkills(updatedSkills);
      await saveToFirestore(updateAuthorSkills, updatedSkills, 'New skill added successfully!');
      setNewItemData({});
      setIsAddingNew(false);
    }
  };

  const handleAddNewSocialLink = async () => {
    if (newItemData.name && newItemData.url && newItemData.name.trim() && newItemData.url.trim()) {
      const newLink = {
        id: newItemData.name.trim().toLowerCase(),
        url: newItemData.url.trim(),
        icon: getDefaultIcon(newItemData.name.trim())
      };
      const updatedLinks = [...socialLinks, newLink];
      setSocialLinks(updatedLinks);
      await saveToFirestore(updateSocialLinks, updatedLinks, 'New social link added successfully!');
      setNewItemData({});
      setIsAddingNew(false);
    }
  };

  // Default icon function
  const getDefaultIcon = (name) => {
    const iconName = name.toLowerCase();
    if (iconName.includes('github')) {
      return <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>;
    } else if (iconName.includes('linkedin')) {
      return <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
    } else if (iconName.includes('twitter')) {
      return <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>;
    } else if (iconName.includes('instagram')) {
      return <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    } else if (iconName.includes('mail')) {
      return <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    } else {
      return <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
    }
  };

  // Render content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="section-content home-management">
            <div className="home-header">
              <h2>Homepage Management</h2>
              <p>Manage all homepage content from here</p>
              {loading && <div className="loading-indicator">🔄 Syncing with Firestore...</div>}
              {error && <div className="error-indicator">❌ {error}</div>}
            </div>
            
            {/* Author Description Section */}
            <div className="management-section">
              <h3>📝 Author Description</h3>
              <div className="author-description-manager">
                {editingItem === 'author-description' ? (
                  <div className="edit-form">
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      className="edit-textarea"
                      rows="4"
                      placeholder="Enter author description..."
                    />
                    <div className="edit-actions">
                      <button onClick={handleSaveAuthorDescription} className="save-btn">Save</button>
                      <button onClick={() => setEditingItem(null)} className="cancel-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="display-content">
                    <p className="content-text">{authorDescription}</p>
                    <button onClick={handleEditAuthorDescription} className="edit-btn">Edit</button>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="management-section">
              <h3>🎯 Skills & Technologies</h3>
              <div className="skills-manager">
                <div className="skills-grid">
                  {authorSkills.map((skill, index) => (
                    <div key={index} className="skill-item">
                      {editingItem === `skill-${index}` ? (
                        <div className="edit-form inline">
                          <input
                            type="text"
                            value={editFormData.skill}
                            onChange={(e) => setEditFormData({...editFormData, skill: e.target.value})}
                            className="edit-input"
                          />
                          <div className="edit-actions">
                            <button onClick={() => handleSaveSkill(index)} className="save-btn">✓</button>
                            <button onClick={() => setEditingItem(null)} className="cancel-btn">✕</button>
                          </div>
                        </div>
                      ) : (
                        <div className="skill-display">
                          <span className="skill-name">{skill}</span>
                          <div className="skill-actions">
                            <button onClick={() => handleEditSkill(skill, index)} className="edit-btn">✏️</button>
                            <button onClick={() => handleDeleteSkill(index)} className="delete-btn">🗑️</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add New Skill */}
                  <div className="skill-item add-new">
                    {isAddingNew === 'skill' ? (
                      <div className="edit-form inline">
                        <input
                          type="text"
                          value={newItemData.skill || ''}
                          onChange={(e) => setNewItemData({...newItemData, skill: e.target.value})}
                          className="edit-input"
                          placeholder="Enter new skill..."
                        />
                        <div className="edit-actions">
                          <button onClick={handleAddNewSkill} className="save-btn">✓</button>
                          <button onClick={() => setIsAddingNew(false)} className="cancel-btn">✕</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setIsAddingNew('skill')} className="add-btn">+ Add Skill</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="management-section">
              <h3>🔗 Social Links</h3>
              <div className="social-links-manager">
                {socialLinks.map((link, index) => (
                  <div key={link.id} className="social-item">
                    {editingItem === `social-${link.id}` ? (
                      <div className="edit-form">
                        <div className="form-group">
                          <label>Name:</label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                            className="edit-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>URL:</label>
                          <input
                            type="url"
                            value={editFormData.url}
                            onChange={(e) => setEditFormData({...editFormData, url: e.target.value})}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-actions">
                          <button onClick={handleSaveSocialLink} className="save-btn">Save</button>
                          <button onClick={() => setEditingItem(null)} className="cancel-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="social-display">
                        <div className="social-info">
                          <div className="social-icon">{link.icon}</div>
                          <div className="social-details">
                            <span className="social-name">{link.id}</span>
                            <span className="social-url">{link.url}</span>
                          </div>
                        </div>
                        <div className="social-actions">
                          <button onClick={() => handleEditSocialLink(link)} className="edit-btn">✏️</button>
                          <button onClick={() => handleDeleteSocialLink(link.id)} className="delete-btn">🗑️</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add New Social Link */}
                <div className="social-item add-new">
                  {isAddingNew === 'social' ? (
                    <div className="edit-form">
                      <div className="form-group">
                        <label>Name:</label>
                        <input
                          type="text"
                          value={newItemData.name || ''}
                          onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                          className="edit-input"
                          placeholder="e.g., github, linkedin, twitter"
                        />
                      </div>
                      <div className="form-group">
                        <label>URL:</label>
                        <input
                          type="url"
                          value={newItemData.url || ''}
                          onChange={(e) => setNewItemData({...newItemData, url: e.target.value})}
                          className="edit-input"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="edit-actions">
                        <button onClick={handleAddNewSocialLink} className="save-btn">Add</button>
                        <button onClick={() => setIsAddingNew(false)} className="cancel-btn">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setIsAddingNew('social')} className="add-btn">+ Add Social Link</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="section-content">
            <h2>Documents</h2>
            <p>Documents section content</p>
          </div>
        );
      case 'projects':
        return (
          <div className="section-content">
            <h2>Projects</h2>
            <p>Projects section content</p>
          </div>
        );
      case 'about':
        return (
          <div className="section-content">
            <h2>About</h2>
            <p>About section content</p>
          </div>
        );
      case 'contacts':
        return (
          <div className="section-content">
            <h2>Contacts</h2>
            <p>Contacts section content</p>
          </div>
        );
      default:
        return (
          <div className="section-content">
            <h2>Homepage</h2>
            <p>Welcome to the Controller Homepage section</p>
          </div>
        );
    }
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

  // Load homepage data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadHomepageData();
      
      // Set up real-time listener for Firestore updates
      const unsubscribe = subscribeToHomepageData((data) => {
        // Update local state when Firestore data changes
        if (data.socialLinks) {
          const reconstructedLinks = data.socialLinks.map(link => ({
            ...link,
            icon: getDefaultIcon(link.id)
          }));
          setSocialLinks(reconstructedLinks);
        }
        
        if (data.authorDescription) {
          setAuthorDescription(data.authorDescription);
        }
        
        if (data.authorSkills) {
          setAuthorSkills(data.authorSkills);
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
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
        {/* Social Media Links - Repurposed as Navigation Links */}
        <div className="social-links-container">
          {navigationLinks.map((link) => (
            <div key={link.id} className="social-link-wrapper">
              <button 
                className={`social-link ${activeSection === link.id ? 'active' : ''}`}
                aria-label={link.label}
                onClick={() => handleNavigationClick(link)}
                title={`Go to ${link.label}`}
              >
                {link.icon}
              </button>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="controller-content">
          {renderSectionContent()}
        </div>

        {/* Command Line Interface (UI Only) */}
        <div className="command-line-container">
          <div className="glass-panel">
            <div className="command-input-wrapper">
              <span className="prompt-symbol">$</span>
              <input
                type="text"
                className="command-input"
                placeholder="Controller mode - UI only (use navigation buttons)"
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
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
