import * as admin from 'firebase-admin';

const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
const formattedKey = rawKey
  .replace(/^['"]|['"]$/g, '') // Hapus tanda kutip di awal/akhir jika ada
  .replace(/\\n/g, '\n');      // Ubah literal \n menjadi newline asli

const adminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formattedKey.includes('BEGIN PRIVATE KEY') ? formattedKey : undefined,
};

function getAdminApp() {
  if (!admin.apps.length) {
    if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
      throw new Error(
        "Firebase Admin credentials missing. Ensure environment variables are set."
      );
    }
    admin.initializeApp({
      credential: admin.credential.cert(adminConfig),
    });
  }
  return admin.app();
}

/**
 * 🛡️ PROXY-BASED LAZY INITIALIZATION
 * This prevents the Firebase Admin SDK from initializing during the Next.js 
 * build-time static analysis phase (page data collection), which would 
 * otherwise cause the build to crash if credentials are not fully available.
 */
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop) {
    const service = getAdminApp().firestore();
    return (service as any)[prop];
  }
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(target, prop) {
    const service = getAdminApp().auth();
    return (service as any)[prop];
  }
});
