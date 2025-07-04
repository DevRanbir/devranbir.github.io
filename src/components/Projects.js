import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import './ProjectsStyles.css';

const Projects = () => {
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
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [editingProject, setEditingProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    type: '',
    url: '',
    description: '',
    dateAdded: new Date().toISOString().split('T')[0]
  });

  // Dropdown items for Windows Explorer style interface
  const dropdownItems = [
    { id: 1, name: 'Documents', icon: '📄', type: 'folder' },
    { id: 5, name: 'About', icon: '👤', type: 'action' },
    { id: 6, name: 'Contact', icon: '📫', type: 'action' },
    { id: 7, name: 'Home', icon: '🏠', type: 'action' },
  ];
  
  // Command templates for edit mode specific to Projects
  const commandTemplates = [
    { id: 'add', template: 'add [type] [name] [url] [description]', description: 'Add a new project' },
    { id: 'batch-add', template: 'batch-add [type1] [name1] [url1] [desc1] | [type2] [name2] [url2] [desc2] | ...', description: 'Add multiple projects' },
    { id: 'edit', template: 'edit [oldtype] [oldname] - [newtype] [newname] [newdesc]', description: 'Edit project' },
    { id: 'remove', template: 'remove [name]', description: 'Remove a project' },
    { id: 'batch-remove', template: 'batch-remove [name1] [name2] [name3] ...', description: 'Remove multiple projects' },
    { id: 'batch-remove-all', template: 'batch-remove all', description: 'Remove all projects' },
    { id: 'exit', template: 'exit', description: 'Exit edit mode' },
  ];
  
  // Allowed project types
  const allowedTypes = [
    { value: 'web', label: 'Web Application', icon: '🌐' },
    { value: 'mobile', label: 'Mobile App', icon: '📱' },
    { value: 'desktop', label: 'Desktop App', icon: '🖥️' },
    { value: 'ai', label: 'AI/ML', icon: '🤖' },
    { value: 'blockchain', label: 'Blockchain', icon: '⛓️' }
  ];
  
  const handleInputChange = (e) => {
    setCommandInput(e.target.value);
    setIsDropdownOpen(e.target.value.length > 0);
  };
  
  // Function to filter projects based on search query
  const getFilteredProjects = () => {
    const query = commandInput.toLowerCase().trim();
    if (!query || editMode) return [];
    
    return projects.filter(project => 
      project.name.toLowerCase().includes(query) || 
      (project.description && project.description.toLowerCase().includes(query)) ||
      project.type.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to 5 results
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
    } else if (typeof item === 'object' && 'id' in item && 'name' in item && 'type' in item && 'url' in item) {
      // This is a project search result (must have a url property)
      window.open(item.url, '_blank');
      setCommandInput('');
      setIsDropdownOpen(false);
      return;
    } else {
      // This is a regular folder/file item
      console.log(`Selected: ${item.name}`);
      
      // Handle navigation
      if (item.name === 'Home') {
        setCommandInput('');
        setIsDropdownOpen(false);
        navigate('/');
        return;
      } else if (item.name === 'Documents') {
        setCommandInput('');
        setIsDropdownOpen(false);
        navigate('/documents');
        return;
      }
      
      setCommandInput(item.name);
    }
    // Keep dropdown open for command templates in edit mode
    if (!(editMode && typeof item === 'object' && 'template' in item)) {
      setIsDropdownOpen(false);
    }
  };
  
  // Helper function to ensure URL has proper protocol
  const ensureValidUrl = (url) => {
    // If URL doesn't start with http:// or https://, add https://
    if (url && !url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  };
  
  // Password handling and edit mode functionality
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
        // Already on projects page, just show message
        showMessage('You are already on the Projects page.');
        return;
      }
      
      if (command === 'edit') {
        setShowPasswordModal(true);
      } else if (editMode) {
        // Process commands only available in edit mode
        
        // Command pattern: "add [type] [name] [url] [description]" - To add a new project
        if (command.match(/^add\s+(web|mobile|desktop|ai|blockchain)\s+([^\s]+)\s+([^\s]+)(?:\s+(.*))?$/)) {
          const matches = command.match(/^add\s+(web|mobile|desktop|ai|blockchain)\s+([^\s]+)\s+([^\s]+)(?:\s+(.*))?$/);
          const type = matches[1];
          const name = matches[2];
          const url = matches[3];
          const description = matches[4] || '';
          
          handleAddProject(name, type, url, description);
        }
        // Command pattern: "batch-add [type1] [name1] [url1] [desc1] | [type2] [name2] [url2] [desc2] | ..." - To add multiple projects
        else if (command.match(/^batch-add\s+(.+)$/)) {
          const matches = command.match(/^batch-add\s+(.+)$/);
          const projectsString = matches[1];
          
          // Split by | to get individual project entries
          const projectEntries = projectsString.split('|').map(entry => entry.trim());
          const projectsData = [];
          
          projectEntries.forEach(entry => {
            const entryMatch = entry.match(/^(web|mobile|desktop|ai|blockchain)\s+([^\s]+)\s+([^\s]+)(?:\s+(.*))?$/);
            if (entryMatch) {
              projectsData.push({
                type: entryMatch[1],
                name: entryMatch[2],
                url: entryMatch[3],
                description: entryMatch[4] || ''
              });
            }
          });
          
          if (projectsData.length > 0) {
            handleBatchAddProjects(projectsData);
          } else {
            showMessage("Invalid batch-add format. Use: batch-add type1 name1 url1 desc1 | type2 name2 url2 desc2");
          }
        }
        // Command pattern: "edit [oldtype] [oldname] - [newtype] [newname] [newdesc]" - To edit an existing project
        else if (command.match(/^edit\s+(web|mobile|desktop|ai|blockchain)\s+([^\s]+)\s+-\s+(web|mobile|desktop|ai|blockchain)\s+([^\s]+)(?:\s+(.*))?$/)) {
          const matches = command.match(/^edit\s+(web|mobile|desktop|ai|blockchain)\s+([^\s]+)\s+-\s+(web|mobile|desktop|ai|blockchain)\s+([^\s]+)(?:\s+(.*))?$/);
          const oldType = matches[1];
          const oldName = matches[2];
          const newType = matches[3];
          const newName = matches[4];
          const newDescription = matches[5] || '';
          
          // Find project by type and name
          const project = projects.find(p => p.type === oldType && p.name === oldName);
          if (project) {
            handleEditProject(project.id, newName, newType, newDescription);
          } else {
            showMessage(`Project "${oldName}" of type "${oldType}" not found.`);
          }
        }
        // Command pattern: "remove [name]" - To remove a project
        else if (command.match(/^remove\s+(.+)$/)) {
          const matches = command.match(/^remove\s+(.+)$/);
          const name = matches[1];
          
          // Find project by name
          const project = projects.find(p => p.name === name);
          if (project) {
            handleRemoveProject(project.id);
          } else {
            showMessage(`Project "${name}" not found.`);
          }
        }
        // Command pattern: "batch-remove [name1] [name2] [name3] ..." - To remove multiple projects
        else if (command.match(/^batch-remove\s+(.+)$/)) {
          const matches = command.match(/^batch-remove\s+(.+)$/);
          const namesString = matches[1];
          
          // Check if it's "batch-remove all"
          if (namesString.toLowerCase().trim() === 'all') {
            handleBatchRemoveAllProjects();
          } else {
            // Split by spaces to get individual names (assuming names don't contain spaces)
            const names = namesString.split(/\s+/).filter(name => name.trim());
            
            if (names.length > 0) {
              handleBatchRemoveProjects(names);
            } else {
              showMessage("Invalid batch-remove format. Use: batch-remove name1 name2 name3 or batch-remove all");
            }
          }
        }
        // Exit edit mode command
        else if (command === 'exit') {
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
    // In a real application, this would use a secure method to verify the password
    const correctPassword = 'ranbir195'; // Change this to your secure password
    if (passwordInput === correctPassword) {
      setEditMode(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      setCommandInput(''); // Clear the command input
      // Show the dropdown with command templates
      setIsDropdownOpen(true);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };
  
  // Project management functions
  const handleAddProject = (name, type, url, description = '') => {
    // Ensure URL has proper protocol
    const validUrl = ensureValidUrl(url);
    
    const newId = Math.max(...projects.map(project => project.id), 0) + 1;
    const newProject = {
      id: newId,
      name: name,
      type: type || 'web', // Use provided type or default to web
      url: validUrl,
      description: description,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    showMessage(`Project "${name}" added successfully!`);
    
    // Save to localStorage
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };
  
  const handleEditProject = (id, name, type, description) => {
    const projectIndex = projects.findIndex(project => project.id === id);
    if (projectIndex === -1) {
      showMessage(`Project with ID ${id} not found.`);
      return;
    }
    
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = {
      ...updatedProjects[projectIndex],
      name: name,
      type: type || updatedProjects[projectIndex].type,
      description: description !== undefined ? description : updatedProjects[projectIndex].description
    };
    
    setProjects(updatedProjects);
    showMessage(`Project with ID ${id} updated successfully!`);
    
    // Save to localStorage
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };
  
  const handleRemoveProject = (id) => {
    const projectIndex = projects.findIndex(project => project.id === id);
    if (projectIndex === -1) {
      showMessage(`Project with ID ${id} not found.`);
      return;
    }
    
    const projectName = projects[projectIndex].name;
    if (window.confirm(`Are you sure you want to remove "${projectName}"?`)) {
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      showMessage(`Project "${projectName}" removed successfully!`);
      
      // Save to localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  };

  // Batch operations
  const handleBatchAddProjects = (projectsData) => {
    let addedCount = 0;
    const updatedProjects = [...projects];
    
    projectsData.forEach(({ type, name, url, description }) => {
      if (type && name && url) {
        const validUrl = ensureValidUrl(url);
        const newId = Math.max(...updatedProjects.map(project => project.id), 0) + 1 + addedCount;
        
        const newProject = {
          id: newId,
          name: name,
          type: type,
          url: validUrl,
          description: description || '',
          dateAdded: new Date().toISOString().split('T')[0]
        };
        
        updatedProjects.push(newProject);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      showMessage(`Successfully added ${addedCount} project(s)!`);
    } else {
      showMessage("No valid projects to add. Check your format.");
    }
  };

  const handleBatchRemoveProjects = (names) => {
    let removedCount = 0;
    let updatedProjects = [...projects];
    
    names.forEach(name => {
      const projectIndex = updatedProjects.findIndex(p => p.name === name.trim());
      if (projectIndex !== -1) {
        updatedProjects = updatedProjects.filter(p => p.name !== name.trim());
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      showMessage(`Successfully removed ${removedCount} project(s)!`);
    } else {
      showMessage("No matching projects found to remove.");
    }
  };

  const handleBatchRemoveAllProjects = () => {
    if (projects.length === 0) {
      showMessage("No projects to remove.");
      return;
    }
    
    const projectCount = projects.length;
    if (window.confirm(`Are you sure you want to remove all ${projectCount} project(s)? This action cannot be undone.`)) {
      setProjects([]);
      localStorage.setItem('projects', JSON.stringify([]));
      showMessage(`Successfully removed all ${projectCount} project(s)!`);
      
      // Reset pagination to first page
      setCurrentPage(0);
    }
  };
  
  const handleExitEditMode = () => {
    setEditMode(false);
    setEditingProject(null);
    setIsAddingProject(false);
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
  
  // Project form handlers
  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectFormData({
      ...projectFormData,
      [name]: value
    });
  };
  
  const handleProjectFormSubmit = (e) => {
    e.preventDefault();
    
    if (isAddingProject) {
      // Adding a new project
      handleAddProject(
        projectFormData.name,
        projectFormData.type,
        projectFormData.url,
        projectFormData.description
      );
    } else if (editingProject) {
      // Editing an existing project
      handleEditProject(
        editingProject.id,
        projectFormData.name,
        projectFormData.type,
        projectFormData.description
      );
    }
    
    // Reset form and state
    setProjectFormData({
      name: '',
      type: '',
      url: '',
      description: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
    setEditingProject(null);
    setIsAddingProject(false);
  };
  
  const startEditingProject = (project) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      type: project.type,
      url: project.url,
      description: project.description || '',
      dateAdded: project.dateAdded
    });
  };
  
  const startAddingProject = () => {
    setIsAddingProject(true);
    setEditingProject(null);
    setProjectFormData({
      name: '',
      type: '',
      url: '',
      description: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
  };
  
  const cancelProjectForm = () => {
    setEditingProject(null);
    setIsAddingProject(false);
    setProjectFormData({
      name: '',
      type: '',
      url: '',
      description: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
  };

  // Clock update effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Update CSS custom properties for the clock display
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      document.documentElement.style.setProperty('--timer-hours', `"${hours}"`);
      document.documentElement.style.setProperty('--timer-minutes', `"${minutes}"`);
      document.documentElement.style.setProperty('--timer-seconds', `"${seconds}"`);
    };

    // Update immediately
    updateClock();
    
    // Update every second
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load projects from localStorage on initial render
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        
        // Ensure all projects have description properties
        const updatedProjects = parsedProjects.map(project => {
          const updatedProject = { ...project };
          if (!updatedProject.description) {
            updatedProject.description = '';
          }
          return updatedProject;
        });
        
        setProjects(updatedProjects);
        
        // Save the updated projects back to localStorage
        if (JSON.stringify(parsedProjects) !== JSON.stringify(updatedProjects)) {
          localStorage.setItem('projects', JSON.stringify(updatedProjects));
        }
      } catch (error) {
        console.error('Error loading projects from localStorage:', error);
      }
    }
    
    // Load the latest Spline viewer script with error handling
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js';
    script.onerror = () => {
      console.warn('Failed to load Spline viewer script, falling back to basic version');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // Function to get project icon based on type
  const getProjectIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'web':
        return <i className="fas fa-window-maximize" style={{fontSize: '60px', color: '#00cec9'}}></i>; 
        // Alternative: 'fa-globe', 'fa-window-maximize'
        case 'mobile':
        return <i className="fas fa-mobile-screen-button" style={{fontSize: '60px', color: '#e17055'}}></i>; 
        // Alternative: 'fa-mobile'
        case 'desktop':
        return <i className="fas fa-display" style={{fontSize: '60px', color: '#6c5ce7'}}></i>; 
        // Alternative: 'fa-desktop'
        case 'ai':
        return <i className="fas fa-brain" style={{fontSize: '60px', color: '#fd79a8'}}></i>; 
        // Alternative: 'fa-robot'
        case 'blockchain':
        return <i className="fas fa-cubes" style={{fontSize: '60px', color: '#d63031'}}></i>; 
        // Alternative: 'fa-link'
        default:
        return <i className="fas fa-code" style={{fontSize: '60px', color: '#0984e3'}}></i>;
    }
    };


  // Pagination functions
  const projectsPerPage = 2;
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = currentPage * projectsPerPage;
  const currentProjects = projects.slice(startIndex, startIndex + projectsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
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
                    // Command templates in edit mode
                    commandTemplates.map((cmd) => (
                      <div 
                        key={cmd.id} 
                        className="explorer-item command-template"
                        onClick={() => handleItemClick(cmd)}
                      >
                        <div className="item-icon">{
                          cmd.id === 'exit' ? '🚪' : 
                          cmd.id === 'add' ? '➕' : 
                          cmd.id === 'batch-add' ? '📝' :
                          cmd.id === 'edit' ? '✏️' : 
                          cmd.id === 'remove' ? '❌' : 
                          cmd.id === 'batch-remove' ? '🗂️' :
                          cmd.id === 'batch-remove-all' ? '🗑️' :
                          '📝'
                        }</div>
                        <div className="item-name">{cmd.id}</div>
                        <div className="item-description">{cmd.description}</div>
                      </div>
                    ))
                    :
                    // Project search results and regular items
                    <>
                      {getFilteredProjects().length > 0 && (
                        <>
                          <div className="search-section-header">
                            <span>🚀 Projects ({getFilteredProjects().length} found)</span>
                          </div>
                          {getFilteredProjects().map((project) => (
                            <div 
                              key={`project-${project.id}`} 
                              className="explorer-item project-search-result"
                              onClick={() => handleItemClick(project)}
                              title={`${project.name} - Click to open`}
                            >
                              <div className="item-icon">
                                {project.type === 'web' ? '🌐' : 
                                 project.type === 'mobile' ? '📱' : 
                                 project.type === 'desktop' ? '🖥️' : 
                                 project.type === 'ai' ? '🤖' : 
                                 project.type === 'blockchain' ? '⛓️' : '💻'}
                              </div>
                              <div className="item-details">
                                <div className="item-name">{project.name}</div>
                                {project.description && (
                                  <div className="item-description">{project.description.substring(0, 40)}...</div>
                                )}
                                <div className="item-meta">{project.type.toUpperCase()}</div>
                              </div>
                            </div>
                          ))}
                          <div className="search-separator"></div>
                        </>
                      )}
                      {/* Regular navigation items */}
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
                    </>
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

        {/* Projects Section */}
        <div className="projects-section" style={{ position: 'relative', zIndex: 10 }}>
          <div className="projects-header">
            <img src="/pic5.png" alt="My Projects" className="projects-header-image" />
          </div>
          
          {projects.length > 0 && (
            <div className="pagination-info">
              <span>Showing {currentProjects.length} of {projects.length} projects</span>
            </div>
          )}
          
          <div className="projects-list">
            {currentProjects.map((project) => (
              <div 
                key={project.id} 
                className="project-item"
                onClick={() => window.open(project.url, '_blank')}
                style={{ cursor: 'pointer' }}
                title="Click to open project"
              >
                <div 
                  className="project-icon"
                  title="Open project"
                >
                  {getProjectIcon(project.type)}
                </div>
                <div className="project-info">
                  <div className="project-name">
                    {project.name}
                  </div>
                  {project.description && (
                    <div className="project-description">
                      {project.description}
                    </div>
                  )}
                </div>
                <div className="project-actions">
                  {editMode ? (
                    <>
                      <button 
                        className="edit-project-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingProject(project);
                        }}
                        title="Edit project name"
                      >
                        ✏️
                      </button>
                      <button 
                        className="remove-project-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProject(project.id);
                        }}
                        title="Delete project"
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {editMode && !isAddingProject && !editingProject && 
             (projects.length === 0 || currentPage === totalPages - 1) && (
              <div 
                className="project-item add-project-item"
                onClick={startAddingProject}
              >
                <div className="project-icon">➕</div>
                <div className="project-info">
                  <div className="project-name">Add New Project</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {projects.length > projectsPerPage && (
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={prevPage} 
                disabled={currentPage === 0}
                title="Previous page"
              >
                ←
              </button>
              <span className="page-indicator">
                {currentPage + 1} / {totalPages}
              </span>
              <button 
                className="pagination-btn" 
                onClick={nextPage} 
                disabled={currentPage >= totalPages - 1}
                title="Next page"
              >
                →
              </button>
            </div>
          )}
          
          {/* Project Form for adding or editing */}
          {(isAddingProject || editingProject) && (
            <div className="project-form-container">
              <div className="project-form glass-panel">
                <h3>{isAddingProject ? 'Add New Project' : 'Edit Project'}</h3>
                <form onSubmit={handleProjectFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="type">Project Type:</label>
                    <select
                      id="type"
                      name="type"
                      value={projectFormData.type}
                      onChange={handleProjectFormChange}
                      required
                    >
                      <option value="">Select a type...</option>
                      {allowedTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="name">Project Name:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={projectFormData.name}
                      onChange={handleProjectFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description (Optional):</label>
                    <textarea
                      id="description"
                      name="description"
                      value={projectFormData.description}
                      onChange={handleProjectFormChange}
                      placeholder="Brief description of the project..."
                      rows="3"
                    />
                  </div>
                  {isAddingProject && (
                    <div className="form-group">
                      <label htmlFor="url">Project URL:</label>
                      <input
                        type="text"
                        id="url"
                        name="url"
                        value={projectFormData.url}
                        onChange={handleProjectFormChange}
                        placeholder="https://github.com/... or https://myproject.com/..."
                        required
                      />
                    </div>
                  )}
                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      {isAddingProject ? 'Add Project' : 'Save Changes'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={cancelProjectForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        
        {/* Command Message - For feedback on command actions */}
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

export default Projects;
