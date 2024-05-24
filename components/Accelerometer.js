import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Accelerometer } from "expo-sensors";
import Paho from "paho-mqtt";

export default function AccelerometerView() {
  const subscribedTopic = "dataEya/accel";
  const options = {
    host: "broker.emqx.io",
    port: 8083,
    path: "/mqtt",
  };
  const client = new Paho.Client(options.host, options.port, options.path);
  const onConnectionLost = (responseObject) => {
    console.log(
      "Connection lost from Accelerometer:",
      responseObject.errorMessage
    );
  };
  client.onConnectionLost = onConnectionLost;
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  const _subscribe = () => {
    setSubscription(Accelerometer.addListener(setData));
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);
  useEffect(() => {
    if (subscription) Accelerometer.setUpdateInterval(1000);
  }, [subscription]);

  const OnConnect = () => {
    if (client.isConnected()) {
      console.log("Succes connection from Accelerometer");
      const newData = {
        ...data,
        device: "accel",
      };
      var message = new Paho.Message(JSON.stringify(newData));
      message.destinationName = subscribedTopic;
      client.subscribe(subscribedTopic, { qos: 0 });
      client.send(message);
    }
  };
  const connect = () => {
    client.connect({
      onSuccess: OnConnect,
      onFailure: (error) => {
        console.log("Failed to connect from Accelerometer", error);
      },
    });
  };
  useEffect(() => {
    if (data && subscription) {
      var message = new Paho.Message(JSON.stringify(data));
      message.destinationName = subscribedTopic;
      const sendMqttMessage = () => {
        if (client.isConnected()) {
          client.send(message);
        } else {
          console.log("Not connected from from Accelerometer");
          connect();
        }
      };
      sendMqttMessage();
    }
  }, [data]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accelerometer:</Text>
      <Text style={styles.text}>x: {data.x}</Text>
      <Text style={styles.text}>y: {data.y}</Text>
      <Text style={styles.text}>z: {data.z}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={subscription ? _unsubscribe : _subscribe}
          style={styles.button}
        >
          <Text>{subscription ? "On" : "Off"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
  },
});
