import { UserData } from '../user/user';

/**
 * Get a single user.
 *
 * @param uid The user's uid.
 * @return A promise that resolves to the user's data.
 */
export function getUser(uid: string): Promise<UserData> {
  // TODO(wgreenberg): implement users
  return Promise.reject("unimplemented");
}
