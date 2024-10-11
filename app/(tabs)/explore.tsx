import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GiftedChat, IMessage, Reply } from "react-native-gifted-chat";
import { Dialogflow_V2 } from "react-native-dialogflow";

import { dialogflowConfig } from "@/env";

// Define the User type
interface User {
  _id: number;
  name: string;
  avatar: string;
}

// Define the Message type, which extends IMessage from Gifted Chat
interface Message extends IMessage {
  user: User;
}

interface DialogflowResponse {
  queryResult: {
    fulfillmentMessages: {
      text: {
        text: string[];
      };
    }[];
    parameters: {
      "geo-city": string; // Assuming 'geo-city' parameter for location
      "date-time": string; // Assuming 'date-time' parameter for date-time
    };
  };
}

// Bot user data
const GoBOT: User = {
  _id: 2,
  name: "Mr. Go",
  avatar: require("@/assets/images/MrBot.jpg"),
};

// Main component
const Explore = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Initialize with a default message from the bot
  useEffect(() => {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig.project_id
    );

    setMessages([
      {
        _id: 1,
        text: `Dear Mr. Soliman,\nHow might I be of assistance?`,
        createdAt: new Date(),
        user: GoBOT,
        quickReplies: {
          type: "radio",
          keepIt: true,
          values: [
            { title: "Reserve a vehicle", value: "Reserve a vehicle" },
            { title: "Return a vehicle", value: "Return a vehicle" },
            {
              title: "Get travel recommendations",
              value: "Get travel recommendations",
            },
            { title: "Explore Promotions", value: "Explore Promotions" },
            { title: "Others", value: "Others" },
          ],
        },
      },
    ]);
  }, []);

  const sendBotResponse = (text: string) => {
    const newMessage: IMessage = {
      _id: Math.random(), // Or generate a unique ID in a more robust way
      text,
      createdAt: new Date(),
      user: GoBOT,
    };

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [newMessage])
    );
  };

  // Handle Google response with proper type
  const handleGoogleResponse = (result: DialogflowResponse) => {
    let text = result.queryResult.fulfillmentMessages[0].text.text[0];
    console.log(text); // You can handle the text from Dialogflow here

    sendBotResponse(text);
  };

  // Function to handle sending new messages
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    // Fetch the message text from the newly sent messages
    let message = newMessages[0].text;

    // Check if the message is from the user (not the bot)
    if (newMessages[0].user._id === 1) {
      Dialogflow_V2.requestQuery(
        message,
        (result: unknown) => {
          // Assert that result is of type DialogflowResponse
          const typedResult = result as DialogflowResponse;
          handleGoogleResponse(typedResult);
        },
        (error) => console.log(error)
      );
    }
  }, []);

  const onQuickReply = (quickReply: Reply[]) => {
    if (quickReply.length > 0) {
      // Create a new message based on the quick reply
      const newMessage: IMessage = {
        _id: Math.random(), // Or generate a unique ID in a more robust way
        text: quickReply[0].value, // Assuming quickReply[0].value contains the message text
        createdAt: new Date(),
        user: {
          _id: 1, // Mark the quick reply as a user message, not bot
          name: "User", // You can customize the user's name
          avatar: "https://placeimg.com/140/140/any", // User avatar
        },
      };

      // Append the new message to the existing messages
      setMessages(
        (previousMessages) => GiftedChat.append(previousMessages, [newMessage]) // Wrap in an array
      );

      // Send the message to Dialogflow
      Dialogflow_V2.requestQuery(
        newMessage.text,
        (result: unknown) => {
          // Assert that result is of type DialogflowResponse
          const typedResult = result as DialogflowResponse;
          handleGoogleResponse(typedResult);
        },
        (error) => console.log(error)
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        user={{
          _id: 1, // Current user ID
        }}
        onSend={(messages) => onSend(messages)}
        onQuickReply={(quickReply: Reply[]) => onQuickReply(quickReply)}
      />
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
