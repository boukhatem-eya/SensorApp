import React from "react";
import GyroscopeView from "./components/Gyroscope";
import AccelerometerView from "./components/Accelerometer";
import { StyleSheet, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <GyroscopeView />
      <AccelerometerView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
});
