/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/emin93/react-native-template-typescript
 *
 * @format
 */

import React from 'react';

import {
  Platform, StyleSheet, Text, View,
} from 'react-native';
import { Event } from './utils/socket';
import geolocation from './utils/navigator/geolocation';
import { loop } from './utils';
import AuthSocketIOProps from './impl/auth-socket';

const instructions = Platform.select({
  android:
    'Double tap R on your keyboard to reload,\n'
    + 'Shake or press menu button for dev menu',
  ios: 'Press Cmd+R to reload,\nCmd+D or shake for dev menu',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default function App() {
  return (
    <AuthSocketIOProps uri={'http://0.0.0.0:8080'} transports={['websocket']}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.tsx</Text>
        <Text style={styles.instructions}>{instructions}</Text>
        <Event
          event="stops"
          onSubscribe={async (emit) => {
            loop(
              async () => {
                const { coords } = await geolocation.getCurrentPosition();
                const { longitude: lng, latitude: lat } = coords;
                return emit('location', { lng, lat });
              },
              1000,
            );
            return emit('sub_stops');
          }}
        >
          {data => <Text style={styles.instructions}>
            {JSON.stringify(data)}
          </Text>}
        </Event>
      </View>
    </AuthSocketIOProps>
  );
}
