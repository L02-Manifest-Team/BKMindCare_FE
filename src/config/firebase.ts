// Mock Firebase for UI testing (no backend required)
// To use real Firebase, uncomment the code below and install firebase package

// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

import { auth, db, storage, addMockData } from '../services/mockFirebase';

// Initialize mock data on first import
// Note: Commented out since we're using real backend now
// try {
//   addMockData();
// } catch (error) {
//   // Silently fail if there's an error initializing mock data
//   console.log('Mock data initialization skipped');
// }

// TODO: Uncomment below to use real Firebase
// const firebaseConfig = {
//   apiKey: "your-api-key",
//   authDomain: "your-project.firebaseapp.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "your-app-id"
// };
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

export { auth, db, storage };
export default { auth, db, storage };

