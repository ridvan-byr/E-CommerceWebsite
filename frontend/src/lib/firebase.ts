import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Zorunlu alanları erken doğrula — env yüklenmediğinde "auth/invalid-api-key"
// yerine net bir hata vermesi için.
const missing = (
  ["apiKey", "authDomain", "projectId", "appId"] as const
).filter((k) => !firebaseConfig[k]);

if (missing.length > 0) {
  throw new Error(
    `Firebase yapılandırması eksik: ${missing
      .map((k) => `NEXT_PUBLIC_FIREBASE_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`)
      .join(", ")}. ` +
      "frontend/.env.local dosyasını doldurup Next.js dev server'ını yeniden başlatın.",
  );
}

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export default app;
