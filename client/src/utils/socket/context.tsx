import React, { useState } from 'react';

import io from 'socket.io-client';

export const SocketIOContext = React.createContext({} as SocketIOClient.Socket);

/**
 * Function type for convenience emit, i.e. non-method, awaitable.
 *
 * You will typically not be constructing these types manually, but will
 * frequently be provided the option to use these functions by the React wrapper
 * components.
 */
export type AsyncEmitCallable = (
  event: string, ...args: readonly any[]
) => Promise<any>;

/**
 * @see SocketIO
 */
export interface SocketIOProps extends SocketIOClient.ConnectOpts {
  children?: React.ReactChild;

  /**
   * Callback on connection.
   *
   * @param sio Socket instance.
   */
  onConnect?(sio: SocketIOClient.Socket): void | Promise<void>;

  /**
   * URI of Socket.IO server. Can leave off for assumed `window.location`.
   *
   * Note: React Native does not have the capability to leave this parameter
   * blank (obviously). You will have to fiddle around with that. Good luck!
   */
  uri?: string;

  /**
   * Socket.IO constructor, with custom URL.
   */
  socketIO?(
    uri: string,
    opts?: SocketIOClient.ConnectOpts
  ): SocketIOClient.Socket;

  /**
   * Socket.IO constructor, with default `window.location` URL.
   */
  socketIO?(opts?: SocketIOClient.ConnectOpts): SocketIOClient.Socket;
}

/**
 * Create a promisified `sio.emit` function.
 */
export function emitAsync(sio: SocketIOClient.Socket): AsyncEmitCallable {
  return (event, ...args) => new Promise(y => sio.emit(event, ...args, y));
}

/**
 * Socket.IO provider wrapper, which creates Socket.IO instance automatically.
 *
 * Note: React Native may have to explicitly specify `transport` as
 * `['websocket']`.
 */
export function SocketIO({
  uri = undefined, children, onConnect, socketIO = io.connect, ...opts
}: SocketIOProps) {
  const [sio] = useState(() => {
    const _ = uri === undefined ? socketIO(opts) : socketIO(uri, opts);
    if (onConnect) {
      _.on('connect', () => onConnect(sio));
    }
    return _;
  });

  return <SocketIOContext.Provider value={sio}>
    {children}
  </SocketIOContext.Provider>;
}
