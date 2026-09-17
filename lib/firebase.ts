import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// Environment handling
// ---------------------------------------------------------------------------

/**
 * Normalize a service-account private key coming from an environment variable.
 *
 * The same key can arrive in several shapes depending on who set the variable:
 *   - literal "\n" escapes (the JSON file, or a .env line wrapped in quotes)
 *   - real newlines (Vercel's env UI, or a multi-line dashboard field)
 *   - wrapped in single/double quotes, sometimes with a trailing comma
 *   - with stray leading/trailing whitespace
 * All of these must collapse to a real PEM key, otherwise `cert()` fails with
 * an opaque OpenSSL error such as "DECODER routines::unsupported".
 */
function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  let key = raw.trim();

  // Strip surrounding quotes if the value was pasted verbatim from JSON.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // Trailing comma from a partial JSON copy.
  if (key.endsWith(",")) key = key.slice(0, -1);

  // Escaped newlines -> real newlines.
  key = key.replace(/\\n/g, "\n");

  // Re-wrap a single-line key that lost every newline.
  if (!key.includes("\n") && key.includes("-----BEGIN")) {
    key = key
      .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
      .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
  }

  return key.trim();
}

function cleanSingleLine(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let val = raw.trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1).trim();
  }
  const lines = val.split(/[\r\n\s,]+/).map((s) => s.trim()).filter(Boolean);
  return lines[0];
}

function cleanProjectId(
  raw: string | undefined,
  clientEmail: string | undefined
): string | undefined {
  const cleaned = cleanSingleLine(raw);
  if (cleaned) {
    const match = cleaned.match(/[a-z0-9-]+/i);
    if (match) return match[0];
  }
  if (clientEmail) {
    const emailMatch = clientEmail.match(/@([a-z0-9-]+)\.iam\.gserviceaccount\.com/i);
    if (emailMatch) return emailMatch[1];
  }
  return undefined;
}

function readConfig() {
  const clientEmail = cleanSingleLine(process.env.FIREBASE_CLIENT_EMAIL);
  const projectId = cleanProjectId(process.env.FIREBASE_PROJECT_ID, clientEmail);
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

let app: App | null = null;
let db: Firestore | null = null;

/**
 * Validate configuration and return a descriptive error when something is
 * missing or malformed. Surfacing this in the API response makes deployment
 * problems debuggable instead of a bare 500.
 */
export function getConfigError(): string | null {
  const { projectId, clientEmail, privateKey } = readConfig();

  const missing: string[] = [];
  if (!projectId) missing.push("FIREBASE_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

  if (missing.length > 0) {
    return `Konfigurasi Firebase belum lengkap. Variabel berikut kosong: ${missing.join(
      ", "
    )}. Set di Vercel → Project Settings → Environment Variables (semua environment), lalu redeploy.`;
  }

  if (!privateKey!.includes("BEGIN PRIVATE KEY")) {
    return "FIREBASE_PRIVATE_KEY tidak berisi PEM yang valid (harus mengandung '-----BEGIN PRIVATE KEY-----'). Salin ulang nilai private_key dari file service account JSON.";
  }

  return null;
}

export function getFirebaseApp(): { app: App; db: Firestore } {
  if (app && db) {
    return { app, db };
  }

  const configError = getConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const { projectId, clientEmail, privateKey } = readConfig();

  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
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
