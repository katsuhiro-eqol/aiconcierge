// lib/auth.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut 
  } from 'firebase/auth';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      throw error;
    }
};
  
// ユーザー登録
export const signUp = async (email, password) => {
try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
} catch (error) {
    throw error;
}
};

// ログイン
export const signIn = async (email, password) => {
try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
} catch (error) {
    throw error;
}
};

// ログアウト
export const logout = async () => {
try {
    await signOut(auth);
} catch (error) {
    throw error;
}
};