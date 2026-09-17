import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Firebase Admin SDK configuration from environment variables
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let app: App;
let db: Firestore;

/**
 * Initialize Firebase Admin SDK and return Firestore instance.
 * Throws if required environment variables are missing.
 */
export function getFirebaseApp(): { app: App; db: Firestore } {
  if (app && db) {
    return { app, db };
  }

  if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
    throw new Error(
      "Missing Firebase configuration. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
    );
  }

  // Initialize app only once
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(firebaseConfig),
    });
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);

  return { app, db };
}

/**
 * Get Firestore database instance
 */
export function getDb(): Firestore {
  const { db } = getFirebaseApp();
  return db;
}

// Collection names
export const COLLECTIONS = {
  PROJECTS: "projects",
  EXPERIENCES: "experiences",
  CERTIFICATES: "certificates",
  CATEGORIES: "categories",
  HERO: "hero",
} as const;
