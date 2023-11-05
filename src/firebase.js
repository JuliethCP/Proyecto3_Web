// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiAp2mGrQC4nxuRMGOcUdrwnydxHJEUBM",
  authDomain: "proyecto3-web-a5ab9.firebaseapp.com",
  projectId: "proyecto3-web-a5ab9",
  storageBucket: "proyecto3-web-a5ab9.appspot.com",
  messagingSenderId: "1011794821174",
  appId: "1:1011794821174:web:ea2f4fc7b3e1c9020bd897"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//export const db = getDatabase(app);

export default getFirestore(app);