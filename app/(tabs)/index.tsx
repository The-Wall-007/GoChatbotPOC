import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, GiftedChat, IMessage } from "react-native-gifted-chat";
import { Dialogflow_V2 } from "react-native-dialogflow";

import { HelloWave } from "@/components/HelloWave";
import { dialogflowConfig2 } from "@/env";

// Bot user data
const GoBOT: User = {
  _id: 2,
  name: "Mr. Go",
  avatar: require("@/assets/images/MrBot.jpg"),
};

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig2.client_email,
      dialogflowConfig2.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig2.project_id
    );

    setIsLoading(false);
  }, []);

  const processVehicleAddIntent = (parameters: any) => {
    const location = parameters["place-types"];
    const carPreference = parameters["vehicle-types"];
    const arrivalTime = parameters["date-time"]?.date_time;
    const passengers = parameters["number"];

    if (arrivalTime && location && carPreference && passengers) {
      alert(
        "Reserve request data:" +
          JSON.stringify({
            location,
            arrivalTime,
            carPreference,
            passengers,
          })
      );
    }
  };

  const processVehicleReturnIntent = (parameters: any) => {
    const departureTime = parameters["date-time"]?.date_time;
    const location = parameters["place-types"];

    if (departureTime && location) {
      alert(
        "Return request data:" +
          JSON.stringify({
            location,
            departureTime,
          })
      );
    }
  };

  const handleIntent = (intentName: string, parameters: any) => {
    if (intentName === "Vehicle.add") {
      processVehicleAddIntent(parameters);
    } else if (intentName === "Vehicle.return") {
      processVehicleReturnIntent(parameters);
    }
  };

  const onSend = (newMessages: IMessage[] = []) => {
    // Update the messages state with the new message
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const messageText = newMessages[0]?.text;

    if (messageText) {
      Dialogflow_V2.requestQuery(
        messageText,
        (result: any) => {
          const botResponse =
            result?.queryResult?.fulfillmentMessages?.[0]?.text?.text?.[0] ||
            "Sorry, I didn't understand that.";

          const intentName = result?.queryResult?.intent?.displayName;
          const parameters = result?.queryResult?.parameters;

          // Handle the intent-based logic
          handleIntent(intentName, parameters);

          // Create a response message from the bot
          const botMessage: IMessage = {
            _id: Math.random().toString(), // Generate a unique ID
            text: botResponse,
            createdAt: new Date(),
            user: GoBOT, // Bot user
          };

          // Update the chat with the bot's response
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [botMessage])
          );
        },
        (error) => console.error("Dialogflow error: ", error)
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HelloWave />
        </View>
      ) : (
        <GiftedChat
          messages={messages}
          user={{
            _id: 1, // Current user ID
          }}
          onSend={(messages) => onSend(messages)}
          renderAvatarOnTop
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
