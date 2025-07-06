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

// Collection and document references
const homepageDocRef = doc(db, 'website-content', HOMEPAGE_DOC_ID);

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
