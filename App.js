// Importing necessary libraries and components
import Paho from "paho-mqtt";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, Button, View, ImageBackground } from "react-native";
import backgroundImage from "./assets/background-image.png";

/************************************
 *    Creating a new MQTT client    *
 *              start               *
 * **********************************/

const client = new Paho.Client(
  "public.mqtthq.com",
  Number(1883),
  `inTopic-${parseInt(Math.random() * 100)}`
);

/************************************
 *    Creating a new MQTT client    *
 *                end               *
 * **********************************/

/************************************
 *          Main component          *
 *              start               *
 * **********************************/

export default function App() {
  /************************************
   *          State variable          *
   *              start               *
   * **********************************/
  const [value, setValue] = useState(0);
  const [messageFromWemos, setMessageFromWemos] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  /************************************
   *          State variable          *
   *                end               *
   * **********************************/

  /********************************************************************
   *   Effect hook to establish MQTT connection and handle messages   *
   *                          start                                   *
   * ******************************************************************/
  useEffect(() => {
    // Function to handle successful connection
    function onConnect() {
      console.log("Connected!");
      setIsConnected(true);
      client.subscribe("outTopic"); // Subscribe to 'outTopic'
    }
    // Function to handle connection failure
    function onFailure() {
      console.log("Failed to connect!");
      setIsConnected(false);
    }
    /***********************************************
     *    Function to handle incoming messages     *
     *                   start                     *
     * *********************************************/
    function onMessageReceived(message) {
      console.log("Message received:", message.payloadString);
      if (message.destinationName === "inTopic") {
        setValue(parseInt(message.payloadString));
      } else if (
        message.destinationName === "outTopic" &&
        parseInt(message.payloadString) === 3
      ) {
        setMessageFromWemos("Switch has been open for more than 10 minutes!");
      }
    }

    /***********************************************
     *    Function to handle incoming messages     *
     *                     end                     *
     * *********************************************/

    /***********************************************
     *          Connect to the MQTT broker         *
     *                   start                     *
     * *********************************************/
    client.connect({
      onSuccess: onConnect,
      onFailure: onFailure,
      });

      /***********************************************
       *          Connect to the MQTT broker         *
       *                     end                     *
       * *********************************************/

    /***********************************************
     *           Set the message handler           *
     * *********************************************/

    client.onMessageArrived = onMessageReceived;

    /*************************************************************
     *   Cleanup function to disconnect when component unmounts  *
     *                         start                             *
     * ***********************************************************/


    return () => {
      client.disconnect();
    };
  }, []);
  /*************************************************************
   *   Cleanup function to disconnect when component unmounts  *
   *                            end                            *
   * ***********************************************************/

  /*************************************************************
   *         Function to change the value and send it          *
   *                          start                            *
   * ***********************************************************/

  function changeValue() {
    if (!isConnected) {
      console.log("Client is not connected.");
      return;
    }

    setValue(1);
    let message = new Paho.Message("1");
    message.destinationName = "inTopic";
    client.send(message);
    console.log("Message sent:", message.payloadString);

    //Reset the value after 5 seconds and set the value back to 0
    setTimeout(() => {
      setValue(0);
      message = new Paho.Message("0");
      message.destinationName = "inTopic";
      client.send(message);
      console.log("Message sent:", message.payloadString);
    }, 5000);
  }
  /**************************************************************
   *         Function to change the value and send it           *
   *                           end                              *
   * ***********************************************************/

  /********************************************
   *          Render the component            *
   *                   start                  *
   ********************************************/
  return (
    <View style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.image}>
        <View style={styles.textContainer}>
          <Text style={styles.output}>Value is: {value}</Text>
          {messageFromWemos && (
            <Text style={styles.messageFromWemos}>{messageFromWemos}</Text>
          )}
          <Button onPress={changeValue} title="Change Value" color="blue" />
        </View>
        <StatusBar style="auto" />
      </ImageBackground>
    </View>
  );
}
/********************************************
 *          Render the component            *
 *                 end                      *
 ********************************************/
/************************************
 *          Main component          *
 *                end               *
 * **********************************/

/********************************************
 *        Styles for the component          *
 *                   start                  *
 ********************************************/

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
});
