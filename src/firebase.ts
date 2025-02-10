// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, Database } from 'firebase/database';

console.log('Firebase 초기화 시작...');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};

// 환경변수 확인
console.log('환경변수 확인:', {
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  apiKey: '***'
});

let app;
let database: Database;
try {
  // Firebase 초기화 수행
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Realtime Database 초기화 성공');
} catch (error) {
  console.error('Firebase 초기화 중 에러:', error);
}

// 초기화된 값들을 최상위에서 export 함 (try/catch 내부가 아님)
export { database };
export default app;
