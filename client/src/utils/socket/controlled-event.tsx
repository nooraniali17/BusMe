import { useEffect, useContext } from 'react';

import { SocketIOContext, emitAsync, AsyncEmitCallable } from './context';

export interface BaseEventProps {
  /**
   * Event to listen to. If none is provided, it will default to `message`,
   * which is the default event name of socket.io-client.
   */
  event?: string;

  /**
   * Callback on event subscribe, i.e. event change, or mount.
   *
   * @param emit Asynchronous emitter function, for convenience.
   * @param sio Socket instance.
   * @param event Event name.
   */
  onSubscribe?(
    emit: AsyncEmitCallable,
    sio: SocketIOClient.Socket,
    event: string
  ): void;

  /**
   * Callback on event unsubscribe, i.e. event change, or unmount.
   *
   * @param emit Asynchronous emitter function, for convenience.
   * @param sio Socket instance.
   * @param event Event name.
   */
  onUnsubscribe?(
    emit: AsyncEmitCallable,
    sio: SocketIOClient.Socket,
    event: string
  ): void;
}

/**
 * @see ControlledEvent
 */
interface ControlledEventProps extends BaseEventProps {
  /**
   * Callback whenever event fires.
   *
   * @param data Data returned from event.
   * @param emit Asynchronous emitter function, for convenience.
   * @param sio Socket instance.
   */
  onEvent(
    data: any,
    emit: AsyncEmitCallable,
    sio: SocketIOClient.Socket
  ): void | Promise<void>;
}

/**
 * Raw event responder. This requires that the surrounding component control
 * event emits, e.g. conditional updates, hence "controlled" event.
 *
 * However, most of the time, this component should not be created manually.
 * Instead, {@see Event} should be used.
 */
export default function ControlledEvent({
  event = 'message',
  onEvent = () => undefined,
  onSubscribe = () => undefined,
  onUnsubscribe = () => undefined,
}: ControlledEventProps) {
  const sio = useContext(SocketIOContext);
  const emit = emitAsync(sio);

  useEffect(() => {
    const cb = (data: any) => onEvent(data, emit, sio);
    onSubscribe(emit, sio, event);
    sio.on(event, cb);

    return () => {
      console.warn(`A Socket.IO listener for "${event}" will be remounted.`);
      onUnsubscribe(emit, sio, event);
      sio.off(event, cb);
    };
  }, [event]);

  return null;
}
