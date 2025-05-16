// filepath: backend/src/firebaseConfig.ts
import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export { db };
export default admin;