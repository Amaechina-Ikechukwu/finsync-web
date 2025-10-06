import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredConfig: Record<string, string | undefined> = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
};

const isBrowser = typeof window !== "undefined";

function getMissingEnvKeys(config: Record<string, string | undefined>) {
  return Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

function assertClientEnvIfBrowser(config: Record<string, string | undefined>) {
  // Only enforce env presence in the browser at runtime to avoid breaking SSR/prerender.
  if (!isBrowser) return;
  const missingKeys = getMissingEnvKeys(config);
  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missingKeys.join(", ")}. ` +
        "Please set the NEXT_PUBLIC_FIREBASE_* variables in your environment.",
    );
  }
}

function createServerOnlyThrowingProxy<T extends object>(message: string): T {
  // Create an object that throws on any property access; helps catch accidental server usage without failing build at import time.
  return new Proxy({} as T, {
    get() {
      throw new Error(message);
    },
    apply() {
      throw new Error(message);
    },
    construct() {
      throw new Error(message);
    },
  });
}

export function initFirebaseApp(): FirebaseApp {
  // During SSR/prerender we must not initialize the Firebase client SDK.
  if (!isBrowser) {
    // Return the existing app if for some reason it exists; otherwise a typed placeholder.
    return (getApps()[0] as FirebaseApp) ?? ({} as FirebaseApp);
  }

  if (!getApps().length) {
    assertClientEnvIfBrowser(requiredConfig);
    initializeApp(firebaseConfig);
  }

  return getApp();
}

export function getFirebaseAuth(): Auth {
  if (!isBrowser) {
    // Avoid crashing static generation; throw only if someone actually tries to use it on the server.
    return createServerOnlyThrowingProxy<Auth>(
      "getFirebaseAuth() is only available in the browser (client components).",
    );
  }
  return getAuth(initFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!isBrowser) {
    return createServerOnlyThrowingProxy<FirebaseStorage>(
      "getFirebaseStorage() is only available in the browser (client components).",
    );
  }
  return getStorage(initFirebaseApp());
}
