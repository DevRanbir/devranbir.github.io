import { db } from './config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  collection,
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

// Collection and document references
const homepageDocRef = doc(db, 'website-content', HOMEPAGE_DOC_ID);
const documentsDocRef = doc(db, 'website-content', DOCUMENTS_DOC_ID);
const projectsDocRef = doc(db, 'website-content', PROJECTS_DOC_ID);
const aboutDocRef = doc(db, 'website-content', ABOUT_DOC_ID);

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

// Update projects
export const updateProjects = async (projects) => {
  try {
    await updateDoc(projectsDocRef, {
      projects: projects,
      lastUpdated: new Date().toISOString()
    });
    console.log('Projects updated successfully');
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
