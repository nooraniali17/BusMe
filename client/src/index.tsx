import React from 'react';

import AppContainer from './components/screens';
import AuthSocketIO from './impl/auth-socket';
import { FullScreenLoading } from './utils/loading';

export default function App() {
  return <AuthSocketIO
    uri={'http://localhost:8080'}
    transports={['websocket']}
    loading={() => <FullScreenLoading />}
  >
    <AppContainer />
  </AuthSocketIO>;
}
