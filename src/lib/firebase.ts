// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmp8tHWwu3M4XMaQTEOJoCD0IwbefOhRU",
  authDomain: "pdf-query-xyqkx.firebaseapp.com",
  projectId: "pdf-query-xyqkx",
  storageBucket: "pdf-query-xyqkx.appspot.com",
  messagingSenderId: "574383557217",
  appId: "1:574383557217:web:b4f7f74c3cf0aee8523820",
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
