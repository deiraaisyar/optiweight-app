import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
    apiKey: 'AIzaSyBr5kR92DTphOt54_oLZBXWC_fUQz4pqyA',
    authDomain: 'optiweight-app.firebaseapp.com',
    projectId: 'optiweight-app',
    storageBucket: 'optiweight-app.firebasestorage.app',
    messagingSenderId: '323962844819',
    appId: '1:323962844819:android:8bd165c783ced71db47f66',
};

// Pastikan Firebase hanya diinisialisasi sekali
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };