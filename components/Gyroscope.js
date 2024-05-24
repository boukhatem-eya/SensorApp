import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gyroscope } from "expo-sensors";
import Paho from "paho-mqtt";

export default function GyroscopeView() {
  const subscribedTopic = "dataEya/gyro";
  const options = {
    host: "broker.emqx.io",
    port: 8083,
    path: "/mqtteya",
  };
  const client = new Paho.Client(options.host, options.port, options.path);

  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  const _subscribe = () => {
    setSubscription(Gyroscope.addListener(setData));
  };

  const onConnectionLost = (responseObject) => {
    console.log("Connection lost from Gyroscope:", responseObject.errorMessage);
  };
  client.onConnectionLost = onConnectionLost;

  const _unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    if (subscription) {
      Gyroscope.setUpdateInterval(1000);
    }
  }, [subscription]);
  const OnConnect = () => {
    if (client.isConnected()) {
      console.log("Succes connection from Gyroscope");
      const newData = {
        ...data,
        device: "gyro",
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
      onFailure: function (error) {
        console.log("Faild to connect from Gyroscope", error);
      },
    });
  };
  useEffect(() => {
    if (data && subscription) {
      var message = new Paho.Message(JSON.stringify(data));
      message.destinationName = subscribedTopic;
      const sendMqttMessage = () => {
        if (client.isConnected()) {
          console.log("Send msg");
          client.send(message);
        } else {
          console.log("Not connected from Gyroscope");
          connect();
        }
      };
      sendMqttMessage();
    }
  }, [data]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Gyroscope:</Text>
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
