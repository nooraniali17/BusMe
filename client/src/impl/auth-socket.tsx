import React, { Component } from 'react';

import authenticate, { AuthenticationData } from './authenticate';
import { SocketIOProps, SocketIO } from '../utils/socket/context';

/**
 * @see AuthSocketIO
 */
interface AuthSocketIOProps extends SocketIOProps {
  /**
   * Authentication function yielding login tokens. Should have a option to
   * force retrieval from authentication server over cached tokens.
   */
  authenticate: typeof authenticate;
}

/**
 * Shortcut for authentication. The default implementation follows a simple
 * connect-login-authenticated model using JWTs and OpenID Connect.
 */
export default class AuthSocketIO extends Component<
AuthSocketIOProps, { ready: boolean }
> {
  public static defaultProps = { authenticate };

  public constructor(props: AuthSocketIOProps) {
    super(props);
    this.state = { ready: false };
  }

  private provider?: JSX.Element;

  public render() {
    this.provider = this.provider || <SocketIO
      {...this.props}
      onConnect={async (sio) => {
        function login({ idToken, accessToken }: AuthenticationData) {
          sio.emit('login', idToken, accessToken);
        }

        login(await this.props.authenticate());
        sio.on('error', async (err: any) => {
          if (err.event === 'login') {
            login(await this.props.authenticate(true));
          }
        });
        sio.on('authenticated', () => this.setState({ ready: true }));
      }}>
      {this.state ? this.props.children : undefined}
    </SocketIO>;
    return this.provider;
  }
}
