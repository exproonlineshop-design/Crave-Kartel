import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseReady = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);
const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(cfg)) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
