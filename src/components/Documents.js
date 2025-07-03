import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import './DocumentsStyles.css';

const Documents = () => {
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
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [documentFormData, setDocumentFormData] = useState({
    name: '',
    type: '',
    url: '',
    description: '',
    dateAdded: new Date().toISOString().split('T')[0]
  });

  // Dummy dropdown items for Windows Explorer style interface
  const dropdownItems = [
    { id: 2, name: 'Projects', icon: '📽️', type: 'folder' },
    { id: 5, name: 'About', icon: '👤', type: 'action' },
    { id: 6, name: 'Contact', icon: '📫', type: 'action' },
    { id: 7, name: 'Home', icon: '🏠', type: 'action' },
  ];
  
  // Command templates for edit mode specific to Documents
  const commandTemplates = [
    { id: 'add', template: 'add [type] [name] [url] [description]', description: 'Add a new document (video/image/pdf/text/ppt)' },
    { id: 'batch-add', template: 'batch-add [type1] [name1] [url1] [desc1] | [type2] [name2] [url2] [desc2] | ...', description: 'Add multiple documents at once' },
    { id: 'edit', template: 'edit [oldtype] [oldname] - [newtype] [newname] [newdesc]', description: 'Edit document type/name/description' },
    { id: 'remove', template: 'remove [name]', description: 'Remove a document' },
    { id: 'batch-remove', template: 'batch-remove [name1] [name2] [name3] ...', description: 'Remove multiple documents at once' },
    { id: 'exit', template: 'exit', description: 'Exit edit mode' },
  ];
  
  // Allowed document types
  const allowedTypes = [
    { value: 'video', label: 'Video', icon: '🎬' },
    { value: 'image', label: 'Image', icon: '🖼️' },
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'text', label: 'Text', icon: '📝' },
    { value: 'ppt', label: 'PowerPoint', icon: '📊' }
  ];
  
  const handleInputChange = (e) => {
    setCommandInput(e.target.value);
    setIsDropdownOpen(e.target.value.length > 0);
  };
  
  // Function to filter documents based on search query
  const getFilteredDocuments = () => {
    const query = commandInput.toLowerCase().trim();
    if (!query || editMode) return [];
    
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(query) || 
      (doc.description && doc.description.toLowerCase().includes(query)) ||
      doc.type.toLowerCase().includes(query)
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
    } else if (typeof item === 'object' && 'id' in item && 'name' in item && 'type' in item) {
      // This is a document search result
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
      
      if (command === 'edit') {
        setShowPasswordModal(true);
      } else if (editMode) {
        // Process commands only available in edit mode
        
        // Command pattern: "add [type] [name] [url] [description]" - To add a new document
        if (command.match(/^add\s+(video|image|pdf|text|ppt)\s+([^\s]+)\s+([^\s]+)(?:\s+(.*))?$/)) {
          const matches = command.match(/^add\s+(video|image|pdf|text|ppt)\s+([^\s]+)\s+([^\s]+)(?:\s+(.*))?$/);
          const type = matches[1];
          const name = matches[2];
          const url = matches[3];
          const description = matches[4] || '';
          
          handleAddDocument(name, type, url, description);
        }
        // Command pattern: "batch-add [type1] [name1] [url1] [desc1] | [type2] [name2] [url2] [desc2] | ..." - To add multiple documents
        else if (command.match(/^batch-add\s+(.+)$/)) {
          const matches = command.match(/^batch-add\s+(.+)$/);
          const documentsString = matches[1];
          
          // Split by | to get individual document entries
          const documentEntries = documentsString.split('|').map(entry => entry.trim());
          const documentsData = [];
          
          documentEntries.forEach(entry => {
            const entryMatch = entry.match(/^(video|image|pdf|text|ppt)\s+([^\s]+)\s+([^\s]+)(?:\s+(.*))?$/);
            if (entryMatch) {
              documentsData.push({
                type: entryMatch[1],
                name: entryMatch[2],
                url: entryMatch[3],
                description: entryMatch[4] || ''
              });
            }
          });
          
          if (documentsData.length > 0) {
            handleBatchAddDocuments(documentsData);
          } else {
            showMessage("Invalid batch-add format. Use: batch-add type1 name1 url1 desc1 | type2 name2 url2 desc2");
          }
        }
        // Command pattern: "edit [oldtype] [oldname] - [newtype] [newname] [newdesc]" - To edit an existing document
        else if (command.match(/^edit\s+(video|image|pdf|text|ppt)\s+([^\s]+)\s+-\s+(video|image|pdf|text|ppt)\s+([^\s]+)(?:\s+(.*))?$/)) {
          const matches = command.match(/^edit\s+(video|image|pdf|text|ppt)\s+([^\s]+)\s+-\s+(video|image|pdf|text|ppt)\s+([^\s]+)(?:\s+(.*))?$/);
          const oldType = matches[1];
          const oldName = matches[2];
          const newType = matches[3];
          const newName = matches[4];
          const newDescription = matches[5] || '';
          
          // Find document by type and name
          const doc = documents.find(d => d.type === oldType && d.name === oldName);
          if (doc) {
            handleEditDocument(doc.id, newName, newType, newDescription);
          } else {
            showMessage(`Document "${oldName}" of type "${oldType}" not found.`);
          }
        }
        // Command pattern: "remove [name]" - To remove a document
        else if (command.match(/^remove\s+(.+)$/)) {
          const matches = command.match(/^remove\s+(.+)$/);
          const name = matches[1];
          
          // Find document by name
          const doc = documents.find(d => d.name === name);
          if (doc) {
            handleRemoveDocument(doc.id);
          } else {
            showMessage(`Document "${name}" not found.`);
          }
        }
        // Command pattern: "batch-remove [name1] [name2] [name3] ..." - To remove multiple documents
        else if (command.match(/^batch-remove\s+(.+)$/)) {
          const matches = command.match(/^batch-remove\s+(.+)$/);
          const namesString = matches[1];
          
          // Split by spaces to get individual names (assuming names don't contain spaces)
          const names = namesString.split(/\s+/).filter(name => name.trim());
          
          if (names.length > 0) {
            handleBatchRemoveDocuments(names);
          } else {
            showMessage("Invalid batch-remove format. Use: batch-remove name1 name2 name3");
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
  
  // Function to convert Google Drive URLs to preview URLs
  const convertToPreviewUrl = (url) => {
    // Check if it's a Google Drive sharing URL
    const gdriveLinkRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/;
    const match = url.match(gdriveLinkRegex);
    
    if (match && match[1]) {
      // Extract the file ID and convert to preview URL
      const fileId = match[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    // Return the original URL if it's not a Google Drive URL
    return url;
  };

  // Document management functions
  const handleAddDocument = (name, type, url, description = '') => {
    // Ensure URL has proper protocol
    const validUrl = ensureValidUrl(url);
    // Convert Google Drive URLs to preview URLs
    const previewUrl = convertToPreviewUrl(validUrl);
    
    const newId = Math.max(...documents.map(doc => doc.id), 0) + 1;
    const newDocument = {
      id: newId,
      name: name,
      type: type || 'pdf', // Use provided type or default to pdf
      url: validUrl,
      previewUrl: previewUrl,
      description: description,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);
    showMessage(`Document "${name}" added successfully!`);
    
    // Save to localStorage
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };
  
  const handleEditDocument = (id, name, type, description) => {
    const documentIndex = documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      showMessage(`Document with ID ${id} not found.`);
      return;
    }
    
    const updatedDocuments = [...documents];
    updatedDocuments[documentIndex] = {
      ...updatedDocuments[documentIndex],
      name: name,
      type: type || updatedDocuments[documentIndex].type,
      description: description !== undefined ? description : updatedDocuments[documentIndex].description
    };
    
    setDocuments(updatedDocuments);
    showMessage(`Document with ID ${id} updated successfully!`);
    
    // Save to localStorage
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  };
  
  const handleRemoveDocument = (id) => {
    const documentIndex = documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      showMessage(`Document with ID ${id} not found.`);
      return;
    }
    
    const documentName = documents[documentIndex].name;
    if (window.confirm(`Are you sure you want to remove "${documentName}"?`)) {
      const updatedDocuments = documents.filter(doc => doc.id !== id);
      setDocuments(updatedDocuments);
      showMessage(`Document "${documentName}" removed successfully!`);
      
      // Save to localStorage
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
    }
  };

  // Batch operations
  const handleBatchAddDocuments = (documentsData) => {
    let addedCount = 0;
    const updatedDocuments = [...documents];
    
    documentsData.forEach(({ type, name, url, description }) => {
      if (type && name && url) {
        const validUrl = ensureValidUrl(url);
        const previewUrl = convertToPreviewUrl(validUrl);
        const newId = Math.max(...updatedDocuments.map(doc => doc.id), 0) + 1 + addedCount;
        
        const newDocument = {
          id: newId,
          name: name,
          type: type,
          url: validUrl,
          previewUrl: previewUrl,
          description: description || '',
          dateAdded: new Date().toISOString().split('T')[0]
        };
        
        updatedDocuments.push(newDocument);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      setDocuments(updatedDocuments);
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      showMessage(`Successfully added ${addedCount} document(s)!`);
    } else {
      showMessage("No valid documents to add. Check your format.");
    }
  };

  const handleBatchRemoveDocuments = (names) => {
    let removedCount = 0;
    let updatedDocuments = [...documents];
    
    names.forEach(name => {
      const docIndex = updatedDocuments.findIndex(d => d.name === name.trim());
      if (docIndex !== -1) {
        updatedDocuments = updatedDocuments.filter(d => d.name !== name.trim());
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      setDocuments(updatedDocuments);
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      showMessage(`Successfully removed ${removedCount} document(s)!`);
    } else {
      showMessage("No matching documents found to remove.");
    }
  };
  
  const handleExitEditMode = () => {
    setEditMode(false);
    setEditingDocument(null);
    setIsAddingDocument(false);
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
  
  // Document form handlers
  const handleDocumentFormChange = (e) => {
    const { name, value } = e.target;
    setDocumentFormData({
      ...documentFormData,
      [name]: value
    });
  };
  
  const handleDocumentFormSubmit = (e) => {
    e.preventDefault();
    
    if (isAddingDocument) {
      // Adding a new document
      handleAddDocument(
        documentFormData.name,
        documentFormData.type,
        documentFormData.url,
        documentFormData.description
      );
    } else if (editingDocument) {
      // Editing an existing document
      handleEditDocument(
        editingDocument.id,
        documentFormData.name,
        documentFormData.type,
        documentFormData.description
      );
    }
    
    // Reset form and state
    setDocumentFormData({
      name: '',
      type: '',
      url: '',
      description: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
    setEditingDocument(null);
    setIsAddingDocument(false);
  };
  
  const startEditingDocument = (document) => {
    setEditingDocument(document);
    setDocumentFormData({
      name: document.name,
      type: document.type,
      url: document.url,
      description: document.description || '',
      dateAdded: document.dateAdded
    });
  };
  
  const startAddingDocument = () => {
    setIsAddingDocument(true);
    setEditingDocument(null);
    setDocumentFormData({
      name: '',
      type: '',
      url: '',
      description: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
  };
  
  const cancelDocumentForm = () => {
    setEditingDocument(null);
    setIsAddingDocument(false);
    setDocumentFormData({
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

  // Load documents from localStorage on initial render
  useEffect(() => {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      try {
        const parsedDocuments = JSON.parse(savedDocuments);
        
        // Ensure all documents have previewUrl and description properties
        const updatedDocuments = parsedDocuments.map(doc => {
          const updatedDoc = { ...doc };
          if (!updatedDoc.previewUrl) {
            updatedDoc.previewUrl = convertToPreviewUrl(doc.url);
          }
          if (!updatedDoc.description) {
            updatedDoc.description = '';
          }
          return updatedDoc;
        });
        
        setDocuments(updatedDocuments);
        
        // Save the updated documents back to localStorage
        if (JSON.stringify(parsedDocuments) !== JSON.stringify(updatedDocuments)) {
          localStorage.setItem('documents', JSON.stringify(updatedDocuments));
        }
      } catch (error) {
        console.error('Error loading documents from localStorage:', error);
      }
    }
    
    // Load the Spline viewer script with error handling
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.10.18/build/spline-viewer.js';
    script.onerror = () => {
      console.warn('Failed to load Spline viewer script');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // Function to get document icon based on type
  const getDocumentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <i className="fas fa-video" style={{fontSize: '60px', color: '#ff6b6b'}}></i>;
      case 'image':
        return <i className="fas fa-image" style={{fontSize: '60px', color: '#4ecdc4'}}></i>;
      case 'pdf':
        return <i className="fas fa-file-pdf" style={{fontSize: '60px', color: '#ff4757'}}></i>;
      case 'text':
        return <i className="fas fa-file-alt" style={{fontSize: '60px', color: '#5f27cd'}}></i>;
      case 'ppt':
        return <i className="fas fa-file-powerpoint" style={{fontSize: '60px', color: '#ff9ff3'}}></i>;
      default:
        return <i className="fas fa-file" style={{fontSize: '60px', color: '#74b9ff'}}></i>;
    }
  };

  // Pagination functions
  const documentsPerPage = 2;
  const totalPages = Math.ceil(documents.length / documentsPerPage);
  const startIndex = currentPage * documentsPerPage;
  const currentDocuments = documents.slice(startIndex, startIndex + documentsPerPage);

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

  // Helper functions for document actions
  const downloadDocument = (doc) => {
    window.open(doc.url, '_blank');
  };

  const previewDocument = (doc) => {
    if (doc.previewUrl && doc.previewUrl !== doc.url) {
      window.open(doc.previewUrl, '_blank');
    } else {
      window.open(doc.url, '_blank');
    }
  };

  // Debug logging
  console.log('Documents component rendering with documents:', documents);
  console.log('Edit mode:', editMode);
  
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
                          '📝'
                        }</div>
                        <div className="item-name">{cmd.id}</div>
                        <div className="item-description">{cmd.description}</div>
                      </div>
                    ))
                    :
                    // Document search results and regular items
                    <>
                      {getFilteredDocuments().length > 0 && (
                        <>
                          <div className="search-section-header">
                            <span>📄 Documents ({getFilteredDocuments().length} found)</span>
                          </div>
                          {getFilteredDocuments().map((doc) => (
                            <div 
                              key={`doc-${doc.id}`} 
                              className="explorer-item document-search-result"
                              onClick={() => handleItemClick(doc)}
                              title={`${doc.name} - Click to open`}
                            >
                              <div className="item-icon">
                                {doc.type === 'video' ? '🎬' : 
                                 doc.type === 'image' ? '🖼️' : 
                                 doc.type === 'pdf' ? '📄' : 
                                 doc.type === 'text' ? '📝' : 
                                 doc.type === 'ppt' ? '📊' : '📁'}
                              </div>
                              <div className="item-details">
                                <div className="item-name">{doc.name}</div>
                                {doc.description && (
                                  <div className="item-description">{doc.description.substring(0, 40)}...</div>
                                )}
                                <div className="item-meta">{doc.type.toUpperCase()}</div>
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
          <spline-viewer url="https://prod.spline.design/G73ETPu1BKxE3nue/scene.splinecode"></spline-viewer>
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

        {/* Documents Section */}
        <div className="documents-section" style={{ position: 'relative', zIndex: 10 }}>
          <div className="documents-header">
            <img src="/pic4.png" alt="My Documents" className="documents-header-image" />
          </div>
          
          {documents.length > 0 && (
            <div className="pagination-info">
              <span>Showing {currentDocuments.length} of {documents.length} documents</span>
            </div>
          )}
          
          <div className="documents-list">
            {currentDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="document-item"
                onClick={() => window.open(doc.url, '_blank')}
                style={{ cursor: 'pointer' }}
                title="Click to open document"
              >
                <div 
                  className="document-icon"
                  title="Open document"
                >
                  {getDocumentIcon(doc.type)}
                </div>
                <div className="document-info">
                  <div className="document-name">
                    {doc.name}
                  </div>
                  {doc.description && (
                    <div className="document-description">
                      {doc.description}
                    </div>
                  )}
                </div>
                <div className="document-actions">
                  {editMode ? (
                    <>
                      <button 
                        className="edit-document-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingDocument(doc);
                        }}
                        title="Edit document name"
                      >
                        ✏️
                      </button>
                      <button 
                        className="remove-document-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDocument(doc.id);
                        }}
                        title="Delete document"
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
            
            {editMode && !isAddingDocument && !editingDocument && 
             (documents.length === 0 || currentPage === totalPages - 1) && (
              <div 
                className="document-item add-document-item"
                onClick={startAddingDocument}
              >
                <div className="document-icon">➕</div>
                <div className="document-info">
                  <div className="document-name">Add New Document</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {documents.length > documentsPerPage && (
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
          
          {/* Document Form for adding or editing */}
          {(isAddingDocument || editingDocument) && (
            <div className="document-form-container">
              <div className="document-form glass-panel">
                <h3>{isAddingDocument ? 'Add New Document' : 'Edit Document'}</h3>
                <form onSubmit={handleDocumentFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="type">Document Type:</label>
                    <select
                      id="type"
                      name="type"
                      value={documentFormData.type}
                      onChange={handleDocumentFormChange}
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
                    <label htmlFor="name">Document Name:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={documentFormData.name}
                      onChange={handleDocumentFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description (Optional):</label>
                    <textarea
                      id="description"
                      name="description"
                      value={documentFormData.description}
                      onChange={handleDocumentFormChange}
                      placeholder="Brief description of the document..."
                      rows="3"
                    />
                  </div>
                  {isAddingDocument && (
                    <div className="form-group">
                      <label htmlFor="url">Document URL:</label>
                      <input
                        type="text"
                        id="url"
                        name="url"
                        value={documentFormData.url}
                        onChange={handleDocumentFormChange}
                        placeholder="https://drive.google.com/file/d/... or youtube.com/..."
                        required
                      />
                    </div>
                  )}
                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      {isAddingDocument ? 'Add Document' : 'Save Changes'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={cancelDocumentForm}>
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

export default Documents;
