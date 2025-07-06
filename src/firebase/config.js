// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  // Replace these with your actual Firebase project configuration
  // You can get these from your Firebase Console -> Project Settings -> General -> Your apps
  apiKey: "AIzaSyCtWsD7dJU3FWencqXY1GIIiGJcgnGsBn8",
  authDomain: "devprofileo.firebaseapp.com",
  projectId: "devprofileo",
  storageBucket: "devprofileo.firebasestorage.app",
  messagingSenderId: "1014270273523",
  appId: "1:1014270273523:web:e67d27da98178454f31486",
  measurementId: "G-0CT9BY25VJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
