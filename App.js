import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, Button, View, ImageBackground } from "react-native";
import backgroundImage from "./assets/background-image.png";

const client = new Paho.Client(
  "public.mqtthq.com",
  Number(1883),
  `inTopic-${parseInt(Math.random() * 100)}`
);

export default function App() {
  const [value, setValue] = useState(0);
  const [messageFromWemos, setMessageFromWemos] = useState('');

  useEffect(() => {
    function onConnect() {
      console.log("Connected!");
      client.subscribe("outTopic");
    }

    function onFailure() {
      console.log("Failed to connect!");
    }

    function onMessageReceived(message) {
      console.log("Message received:", message.payloadString);
      if (message.destinationName === "inTopic") {
        setValue(parseInt(message.payloadString));
      } else if (message.destinationName === "outTopic" && parseInt(message.payloadString) === 3) {
        setMessageFromWemos("Switch has been open for more than 10 minutes!");
      }
    }

    client.connect({
      onSuccess: onConnect,
      onFailure: onFailure,
    });

    client.onMessageArrived = onMessageReceived;

    // Cleanup function
    return () => {
      client.disconnect();
    };
  }, []);

  function changeValue() {
    setValue(1);
    let message = new Paho.Message("1");
    message.destinationName = "inTopic";
    client.send(message);
    console.log("Message sent:", message.payloadString);

    setTimeout(() => {
      setValue(0);
      message = new Paho.Message("0");
      message.destinationName = "inTopic";
      client.send(message);
      console.log("Message sent:", message.payloadString);
    }, 5000);
  }

  function resetWemos() {
    // Send a message to inTopic with the value of 1 to reset the Wemos D1 Mini
    var resetMessage = new Paho.Message("1");
    resetMessage.destinationName = "inTopic";
    client.send(resetMessage);
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.image}>
        <View style={styles.textContainer}>
          <Text style={styles.output}>Value is: {value}</Text>
          {messageFromWemos && (
            <Text style={styles.messageFromWemos}>{messageFromWemos}</Text>
          )}
          <Button
            onPress={changeValue}
            title="Reset"
            color="red"
          />
        </View>
        <StatusBar style="auto" />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9f9",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textContainer: {
    top: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  output: {
    top: 0,
    fontSize: 20,
    color: "red",
  },
  messageFromWemos: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
  },
  reset: {
    fontSize: 30,
    backgroundColor: "green",
    color: "red", // Change this color to the desired color
  },
});
