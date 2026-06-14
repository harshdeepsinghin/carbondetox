import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
 * Sign in with Google.
 * Uses popup on localhost (faster DX) and redirect on deployed domains
 * (more reliable — avoids popup-blocked and third-party cookie issues).
 */
export async function signInWithGoogle(): Promise<User | null> {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isLocal) {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } else {
    // On deployed domains, initiate a redirect — result handled on page load
    await signInWithRedirect(auth, googleProvider);
    return null; // Page will redirect away; caller should not await a user here
  }
}

/**
 * Call this on page mount to capture the result of a Google redirect sign-in.
 * Returns the signed-in User, or null if no redirect sign-in is pending.
 */
export async function getGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch {
    return null;
  }
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
export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}
