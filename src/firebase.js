import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Export the config so it can be used for secondary auth instances
export const firebaseConfig = {
  apiKey: "AIzaSyCV5QWJUsROs0y_OvIH2zo6o1XkMsWLu_k",
  authDomain: "result-analysis-system-1d8b9.firebaseapp.com",
  projectId: "result-analysis-system-1d8b9",
  storageBucket: "result-analysis-system-1d8b9.firebasestorage.app",
  messagingSenderId: "479855739489",
  appId: "1:479855739489:web:863f91d6f93adac7156020",
  measurementId: "G-VPKM5SFXM0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);