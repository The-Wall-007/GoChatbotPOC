import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bubble,
  BubbleProps,
  GiftedChat,
  IMessage,
  Reply,
} from "react-native-gifted-chat";
import { Dialogflow_V2 } from "react-native-dialogflow";
import moment from "moment";

import { HelloWave } from "@/components/HelloWave";
import { dialogflowConfig } from "@/env";

// Define the User type
interface User {
  _id: number;
  name: string;
  avatar: string;
}

// Define the Message type, which extends IMessage from Gifted Chat
interface CustomMessage extends IMessage {
  data?: {
    cars: any[]; // Add the type for cars here if needed
  };
}
interface DialogflowResponse {
  queryResult: {
    fulfillmentMessages: {
      text: {
        text: string[];
      };
    }[];
    parameters: {
      "geo-city-gb": string; // Assuming 'location' parameter for location
      date: string; // Assuming 'date-time' parameter for date-time
      time: string; // Assuming 'date-time' parameter for date-time
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
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  // Updated sendBotResponse to handle car recommendations

  // Update sendBotResponse to use CustomMessage
  const sendBotResponse = (text: string, cars: any[] = []) => {
    let isOptions = text.includes("vehicle will be ready");
    let newMessage: CustomMessage; // Use CustomMessage here

    if (isOptions && cars.length > 0) {
      newMessage = {
        _id: Math.random(), // Generate a unique ID
        text,
        createdAt: new Date(),
        user: GoBOT,
        data: { cars }, // Pass the car data in the message
      };
    } else {
      newMessage = {
        _id: Math.random(),
        text,
        createdAt: new Date(),
        user: GoBOT,
      };
    }

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [newMessage])
    );
  };

  // Handle Google response with proper type
  const handleGoogleResponse = (result: DialogflowResponse) => {
    let text = result.queryResult.fulfillmentMessages[0].text.text[0];
    const location = result.queryResult.parameters["geo-city-gb"];
    const date = result.queryResult.parameters["date"];
    const time = result.queryResult.parameters["time"];

    if (location && date && time) {
      // Format the date-time using Moment.js

      const dateString = `${date}`;
      const timeString = `${time}`;

      const formattedDate = moment(timeString).format("Do MMMM");

      const formattedTime = moment(timeString).format("h:mm A");

      // Get the base response text from Dialogflow
      let responseText = result.queryResult.fulfillmentMessages[0].text.text[0];

      // Replace placeholders with actual values
      responseText = responseText.replace(dateString, formattedDate); // Replace $date-time
      responseText = responseText.replace(timeString, formattedTime); // Replace $date-time

      const cars = [
        {
          id: 1,
          carname: "Tesla Model S",
          image: "https://picsum.photos/200",
          optionData: [
            {
              _id: Math.random(),
              text: "Tesla Model S",
              createAt: new Date(),
              user: {
                _id: 1, // Mark the quick reply as a user message, not bot
                name: "User", // You can customize the user's name
                avatar: "https://placeimg.com/140/140/any", // User avatar
              },
            },
          ],
        },
        {
          id: 2,
          carname: "BMW X5",
          image: "https://picsum.photos/200",
          optionData: [
            {
              _id: Math.random(),
              text: "BMW X5",
              createAt: new Date(),
              user: {
                _id: 1, // Mark the quick reply as a user message, not bot
                name: "User", // You can customize the user's name
                avatar: "https://placeimg.com/140/140/any", // User avatar
              },
            },
          ],
        },
        {
          id: 3,
          carname: "Audi A6",
          image: "https://picsum.photos/200",
          optionData: [
            {
              _id: Math.random(),
              text: "Audi A6",
              createAt: new Date(),
              user: {
                _id: 1, // Mark the quick reply as a user message, not bot
                name: "User", // You can customize the user's name
                avatar: "https://placeimg.com/140/140/any", // User avatar
              },
            },
          ],
        },
        {
          id: 4,
          carname: "Mercedes-Benz C-Class",
          image: "https://picsum.photos/200",
          optionData: [
            {
              _id: Math.random(),
              text: "Mercedes-Benz C-Class",
              createAt: new Date(),
              user: {
                _id: 1, // Mark the quick reply as a user message, not bot
                name: "User", // You can customize the user's name
                avatar: "https://placeimg.com/140/140/any", // User avatar
              },
            },
          ],
        },
        {
          id: 5,
          carname: "Lexus RX",
          image: "https://picsum.photos/200",
          optionData: [
            {
              _id: Math.random(),
              text: "Lexus RX",
              createAt: new Date(),
              user: {
                _id: 1, // Mark the quick reply as a user message, not bot
                name: "User", // You can customize the user's name
                avatar: "https://placeimg.com/140/140/any", // User avatar
              },
            },
          ],
        },
      ];

      // Send the formatted response
      sendBotResponse(responseText, cars);
    } else {
      sendBotResponse(text);
    }
  };

  // Update onSend and onQuickReply functions if necessary
  const onSend = useCallback((newMessages: CustomMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    let message = newMessages[0].text;

    if (newMessages[0].user._id === 1) {
      Dialogflow_V2.requestQuery(
        message,
        (result: unknown) => {
          const typedResult = result as DialogflowResponse;
          handleGoogleResponse(typedResult);
        },
        (error) => console.log(error)
      );
    }
  }, []);

  const renderMessage = (messageProps: { currentMessage: CustomMessage }) => {
    const { currentMessage } = messageProps;

    // Check if the message contains car recommendations
    if (currentMessage.data && currentMessage.data.cars) {
      return (
        <View>
          <Text>{currentMessage.text}</Text>
          <ScrollView horizontal>
            {currentMessage.data.cars.map((car) => (
              <View key={car.id} style={{ margin: 10 }}>
                <Image
                  source={{ uri: car.image }}
                  style={{ width: 100, height: 100 }}
                />
                <Text>{car.carname}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    // Default rendering for messages without cars
    return <Text>{currentMessage.text}</Text>;
  };

  const onQuickReply = (quickReply: Reply[]) => {
    if (quickReply.length > 0) {
      // Create a new message based on the quick reply
      const newMessage: IMessage = {
        _id: Math.random(), // Or generate a unique ID in a more robust way
        text: quickReply[0].value, // Assuming quickReply[0].value contains the message text
        // text: quickReply[0].value, // Assuming quickReply[0].value contains the message text
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

  const renderBubble = (props: BubbleProps<CustomMessage>) => {
    console.log(props.currentMessage.data?.cars);
    if (props.currentMessage.data?.cars) {
      return (
        <View>
          <Bubble {...props} />

          <FlatList
            data={props.currentMessage.data.cars}
            keyExtractor={(car) => car.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSend(item.optionData)}
                style={{ margin: 10 }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 120, height: 120 }}
                />
                <Text
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    right: 10,
                    color: "#fff",
                  }}
                >
                  {item.carname}
                </Text>
              </TouchableOpacity>
            )}
            numColumns={2}
          />
        </View>
      );
    }

    return <Bubble {...props} renderUsernameOnMessage />;
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
          onQuickReply={(quickReply: Reply[]) => onQuickReply(quickReply)}
          renderBubble={renderBubble}
          renderAvatarOnTop
        />
      )}
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
