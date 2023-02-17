import { postJSON, getJSON } from '../api';
import { User as FirebaseUser } from '@firebase/auth';
import { UserData } from '../user/user';

/**
 * Get a single user.
 *
 * @param uid The user's uid.
 * @return A promise that resolves to the user's data.
 */
export function getUser(uid: string): Promise<UserData> {
  return getJSON(`/api/user/${uid}`)
}

export function ensureUser(user: FirebaseUser): Promise<UserData> {
  return postJSON(`/api/user`, { uid: user.uid }, true);
}

export function ensureGuest(user: FirebaseUser): Promise<UserData> {
  return postJSON(`/api/user/guest`, { uid: user.uid }, true);
}