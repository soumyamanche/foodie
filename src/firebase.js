import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-mQxoET5yQa9_Zvo8XZJJune4r82Hf74",
  authDomain: "swiggy-59b43.firebaseapp.com",
  projectId: "swiggy-59b43",
  storageBucket: "swiggy-59b43.firebasestorage.app",
  messagingSenderId: "878051464732",
  appId: "1:878051464732:web:ac4c3c66791e8af027f1d9",
  measurementId: "G-GF96Y8DVEC"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;