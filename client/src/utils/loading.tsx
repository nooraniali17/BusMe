import React from 'react';
import { View } from 'react-native';

import { View as AnimatableView } from 'react-native-animatable';
import { Icon, IconProps } from 'react-native-elements';

import style from '../style';

export function FullScreenLoading(props: Partial<IconProps>) {
  return <View style={style.centeredFill}>
    <Loading size={60} {...props} />
  </View>;
}

export default function Loading(props: Partial<IconProps>) {
  return <AnimatableView
    animation="rotate" easing="linear" iterationCount="infinite"
  >
    <Icon name="spinner-3" type="evilicon" {...props} />
  </AnimatableView>;
}
