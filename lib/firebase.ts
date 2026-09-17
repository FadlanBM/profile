import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

// Firebase Admin SDK configuration from environment variables
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Storage bucket name (without gs:// prefix)
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

let app: App;
let db: Firestore;
let storage: Storage;

/**
 * Initialize Firebase Admin SDK and return Firestore instance.
 * Throws if required environment variables are missing.
 */
export function getFirebaseApp(): { app: App; db: Firestore; storage: Storage } {
  if (app && db && storage) {
    return { app, db, storage };
  }

  if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
    throw new Error(
      "Missing Firebase configuration. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
    );
  }

  if (!storageBucket) {
    throw new Error(
      "Missing FIREBASE_STORAGE_BUCKET environment variable. Example: your-project-id.appspot.com"
    );
  }

  // Initialize app only once
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(firebaseConfig),
      storageBucket,
    });
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  storage = getStorage(app);

  return { app, db, storage };
}

/**
 * Get Firestore database instance
 */
export function getDb(): Firestore {
  const { db } = getFirebaseApp();
  return db;
}

/**
 * Get Firebase Storage instance
 */
export function getFirebaseStorage(): Storage {
  const { storage } = getFirebaseApp();
  return storage;
}

// Collection names
export const COLLECTIONS = {
  PROJECTS: "projects",
  EXPERIENCES: "experiences",
  CERTIFICATES: "certificates",
  CATEGORIES: "categories",
  HERO: "hero",
} as const;
