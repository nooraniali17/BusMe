import AsyncStorage from '@react-native-community/async-storage';
import Auth0 from 'react-native-auth0';

const authStorageKey = '@auth';

export interface AuthenticationData {
  /**
   * Date (in Epoch milliseconds) when this token will expire.
   */
  expiresAt: number;
  
  /**
   * OpenID Connect ID Token.
   */
  idToken: string;

  /**
   * OpenID Connect Access Token (this project expects Auth0 JWT).
   */
  accessToken: string;

  /**
   * Token type. Should usually be `Bearer`.
   */
  tokenType: "Bearer";
}

const auth0 = new Auth0({
  domain: 'bus-me-us.auth0.com',
  clientId: 'l3VFomJk2JRrNZ2BnymXuH54yfhjPgfe',
});

/**
 * Fetch authentication from Auth0 directly, and save modified data to cache.
 */
async function fetchAuthFresh(): Promise<AuthenticationData> {
  const { expiresIn, ...rest } = await auth0.webAuth.authorize({
    scope: 'openid',
    audience: 'https://busme.app'
  });
  const authData = {
    // leave 1 minute for expiry buffer
    expiresAt: Date.now() + expiresIn * 1000 - 60000,
    ...rest
  };
  await AsyncStorage.setItem(authStorageKey, JSON.stringify(authData));
  return authData;
}

/**
 * Fetch authentication from local storage.
 */
async function fetchAuthCache(): Promise<AuthenticationData | undefined> {
  const authRaw = await AsyncStorage.getItem(authStorageKey);
  if (authRaw) {
    const authData: AuthenticationData = JSON.parse(authRaw);
    if (Date.now() < authData.expiresAt) {
      return authData;
    }
  }
}

/**
 * Grab authentication token.
 * 
 * @param force Should the user be forced to manually log in?
 */
export default async function authenticate(force = false) {
  let authData = !force && await fetchAuthCache();
  if (!authData) {
    authData = await fetchAuthFresh();
  }
  return authData;
}
