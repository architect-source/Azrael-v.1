// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-AsBSiJTI5y44OJIWoFz7PMHq8SopNjI",
  authDomain: "azrael-core-sentry.firebaseapp.com",
  projectId: "azrael-core-sentry",
  storageBucket: "azrael-core-sentry.firebasestorage.app",
  messagingSenderId: "233456537122",
  appId: "1:233456537122:web:18b3340266f8417c9d047b",
  measurementId: "G-MW22BZ6YD5"
};
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
