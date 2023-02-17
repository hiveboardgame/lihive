import app from './db/app';
import { getAuth } from '@firebase/auth';

const auth = getAuth(app);

export async function postJSON(uri: string, body: any, authenticated = false): Promise<any> {
  return jsonReq(uri, { method: 'POST', body: JSON.stringify(body) }, authenticated);
}

export async function getJSON(uri: string, authenticated = false): Promise<any> {
  return jsonReq(uri, { method: 'GET' }, authenticated);
}

async function jsonReq(uri: string, options: any, authenticated: boolean): Promise<any> {
  options.headers = {
    'Content-Type': 'application/json',
  };
  if (authenticated) {
    if (!auth.currentUser) {
      throw new Error('user not logged in');
    }
    options.headers['X-Firebase-Token'] = await auth.currentUser.getIdToken();
  }
  const res = await fetch(uri, options)
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(`unsuccessful response code ${res.status}`)
  }
}