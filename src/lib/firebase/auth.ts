import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google using a popup window.
 * @throws FirebaseError on popup blocked or auth failure
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in anonymously — no credentials required.
 * Allows guests to use the app with local-only data.
 */
export async function signInAnonymously(): Promise<User> {
  const result = await firebaseSignInAnonymously(auth);
  return result.user;
}

/**
 * Sign out the current user and clear the auth state.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes.
 * @returns Unsubscribe function — call on component unmount to prevent memory leaks
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void,
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}
