import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALtPrQdkHfTCP00hCSpXn8kdnzZdsaeX8",
  authDomain: "firecircle-488a3.firebaseapp.com",
  projectId: "firecircle-488a3",
  storageBucket: "firecircle-488a3.firebasestorage.app",
  messagingSenderId: "833604179024",
  appId: "1:833604179024:web:6ec472dac581dff9466d55",
  measurementId: "G-KG6NQL7BVV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };