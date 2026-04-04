// 1. FIREBASE SENTRY ACTIVATION
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB-AsBSiJTI5y440JI...", // Use your real key from the screenshot
  authDomain: "azrael-core-sentry.firebaseapp.com",
  projectId: "azrael-core-sentry",
  storageBucket: "azrael-core-sentry.appspot.com",
  messagingSenderId: "233456537122",
  appId: "1:233456537122:web:18b33...",
  measurementId: "G-MW22BZ6YD5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. EXISTING UI LOGIC (Keep these below)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

