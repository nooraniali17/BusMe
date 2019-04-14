const thisAuth = new auth0.WebAuth({
  domain: 'bus-me-us.auth0.com',
  clientID: 'l3VFomJk2JRrNZ2BnymXuH54yfhjPgfe',
  responseType: 'id_token',
  scope: 'openid',
  redirectUri: window.location.href
});

export function forceAuthenticate(auth = thisAuth) {
  return new Promise((y, n) => auth.parseHash((err, res) => {
    if (err) {
      n();
    } else if (res) {
      const { idToken, idTokenPayload = {} } = res;
      localStorage.setItem('token', JSON.stringify({
        idToken,
        expires: (idTokenPayload.exp || 0) * 1000
      }));

      window.location.hash = '';
      y(idToken);
    } else {
      auth.authorize();
    }
  }));
}

function checkStorage() {
  const token = localStorage.getItem('token');
  if (token) {
    const { idToken, expires } = JSON.parse(token);
    if (idToken && Date.now() < expires) {
      return idToken;
    }
  }
}

export default async function authenticate(auth = thisAuth) {
  return checkStorage() || await forceAuthenticate(auth);
}
