import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  projectId: "godavari-organics-arma",
  appId: "1:317984776709:web:71e24a5ab450303d1bb26c",
  storageBucket: "godavari-organics-arma.firebasestorage.app",
  apiKey: "AIzaSyClBi5ndrttDLKkkf_Lp5rzx8XVT4fgfHI",
  authDomain: "godavari-organics-arma.firebaseapp.com",
  messagingSenderId: "317984776709",
  measurementId: "G-FNFXP76FTV"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
