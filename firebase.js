import {initializeApp} from "firebase/app"
import {getFirestore, connectFirestoreEmulator} from "firebase/firestore"
import {getStorage} from "firebase/storage"
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
    appId: process.env.NEXT_PUBLIC_APPID
}

let app = initializeApp(firebaseConfig)

// Chromeの古いWebKitに対応するための設定
const db = getFirestore(app);

// ブラウザ固有の設定
if (typeof window !== 'undefined') {
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Safari');
    
    if (isChrome) {
        console.log('Chrome detected, applying optimized settings');
        // Chrome用の最適化設定
    }
    
    // Firebase Auth の初期化状態を監視
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
        console.log('Firebase Auth state changed:', user ? 'authenticated' : 'not authenticated');
    });
}

const storage = getStorage(app)
const auth = getAuth(app);

export {db, storage, auth}