# Firebase Setup Instructions

This project now uses Firebase Firestore for data storage instead of localStorage. Follow these steps to set up Firebase for your project:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "devranbir-portfolio")
4. Follow the setup wizard (you can disable Google Analytics if not needed)

## 2. Set up Firestore Database

1. In your Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (you can configure security rules later)
4. Select a location for your database (choose closest to your users)

## 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (`</>`)
4. Register your app with a nickname (e.g., "Portfolio Website")
5. Copy the Firebase configuration object

## 4. Update Firebase Configuration

1. Open `src/firebase/config.js`
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-measurement-id" // optional
};
```

## 5. Firestore Security Rules (Optional but Recommended)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to homepage data for all users
    match /website-content/homepage-data {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

## 6. Data Structure

The application stores data in Firestore with the following structure:

```
website-content (collection)
  └── homepage-data (document)
      ├── socialLinks: array of objects
      ├── authorDescription: string
      ├── authorSkills: array of strings
      └── lastUpdated: timestamp
```

## 7. Features

- **Real-time sync**: Changes are automatically synced across all connected clients
- **Offline support**: Firebase provides automatic offline caching
- **Error handling**: Proper error handling with user feedback
- **Loading states**: Visual indicators when data is being loaded or saved

## 8. Environment Variables (Optional)

For better security, you can store your Firebase config in environment variables:

1. Create a `.env` file in your project root
2. Add your Firebase config:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

3. Update `config.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
```

## Troubleshooting

- **Permission denied errors**: Check your Firestore security rules
- **Network errors**: Ensure you have internet connectivity
- **Configuration errors**: Double-check your Firebase config values
- **Module not found**: Make sure you've installed Firebase: `npm install firebase`
