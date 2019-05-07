import React from 'react';

import { Icon } from 'react-native-elements';

import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import MapScreen from './map';

const AppNavigator = createBottomTabNavigator({
  Map: {
    screen: MapScreen,
    navigationOptions: {
      tabBarIcon() {
        return <Icon name="directions-bus" />;
      },
    },
  },
});

export default createAppContainer(AppNavigator);
