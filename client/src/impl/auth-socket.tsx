import React, { useState } from 'react';

import defaultAuthenticate, { AuthenticationData } from './authenticate';
import { SocketIOProps, SocketIO } from '../utils/socket/context';

/**
 * @see AuthSocketIO
 */
interface AuthSocketIOProps extends SocketIOProps {
  /**
   * Authentication function yielding login tokens. Should have a option to
   * force retrieval from authentication server over cached tokens.
   */
  authenticate?: typeof defaultAuthenticate;

  loading(): React.ReactChild;
}

/**
 * Shortcut for authentication. The default implementation follows a simple
 * connect-login-authenticated model using JWTs and OpenID Connect.
 */
export default function AuthSocketIO({
  authenticate = defaultAuthenticate, children, loading, ...props
}: AuthSocketIOProps) {
  const [ready, setReady] = useState(false);

  // set ready in 5 seconds regardless of connection status
  const timeout = setTimeout(() => setReady(true), 5000);

  return <SocketIO
    {...props}
    onConnect={async (sio) => {
      function login({ idToken, accessToken }: AuthenticationData) {
        sio.emit('login', idToken, accessToken);
      }

      login(await authenticate());
      sio.once('error', async (err: any) => {
        if (err.event === 'login') {
          login(await authenticate(true));
        }
      });
      sio.once('authenticated', () => {
        clearTimeout(timeout);
        setReady(true);
      });
    }}
  >
    {ready ? children : loading()}
  </SocketIO>;
}
