import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCaV4Jasng_RsYGmhWzAFQhRWVG5dN0DYg",
  authDomain: "bkmindcare.firebaseapp.com",
  projectId: "bkmindcare",
  storageBucket: "bkmindcare.firebasestorage.app",
  messagingSenderId: "641372169052",
  appId: "1:641372169052:web:951dc52fa14994264b9799",
  measurementId: "G-4H783W1XL3"
};


// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Auth
const auth = getAuth(app);

// Khởi tạo Firestore
const db = getFirestore(app);

// Bật chế độ offline cho Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Chỉ có một tab có thể truy cập Firestore offline');
  } else if (err.code === 'unimplemented') {
    console.warn('Trình duyệt không hỗ trợ offline persistence');
  }
});

// Khởi tạo Storage
const storage = getStorage(app);
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

