import { StyleSheet } from "react-native";

const style = StyleSheet.create({
  centeredFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
} as const);

export default style;