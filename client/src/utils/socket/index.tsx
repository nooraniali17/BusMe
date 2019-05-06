import React, { useContext, useState } from 'react';

import ControlledEvent, { BaseEventProps } from './controlled-event';
import { SocketIOContext, emitAsync, AsyncEmitCallable } from './context';

/**
 * @see Event
 */
export interface EventProps extends BaseEventProps {
  /**
   * Function to create loading spinner (e.g. image, SVG). Will be called
   * if the data is undefined, which shouldn't happen after first event as JSON
   * only has null values.
   */
  loading(): React.ReactNode;

  /**
   * A render function, essentially the same as a consumer.
   *
   * @param data Data received upon event.
   * @param emit Simple async emit function.
   */
  children(data: any, emit: AsyncEmitCallable): React.ReactNode;
}

/**
 * Socket consumer. Use to consume Socket.IO events from the provider. Each
 * render will provide new data (not necessarily unique).
 *
 * This is a convenience wrapper around ControlledEvent.
 *
 * @see SocketIO
 * @see ControlledEvent
 */
export default function Event({ loading, children, ...opts }: EventProps) {
  const [data, setData] = useState();
  const emit = emitAsync(useContext(SocketIOContext));

  return <>
    <ControlledEvent {...opts} onEvent={setData} />
    {data === undefined ? children(data, emit) : loading() }
  </>;
}

export { SocketIO } from './context';
