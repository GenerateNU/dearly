import { Handler } from "aws-lambda";
import Expo, { ExpoPushMessage } from "expo-server-sdk";

export const handler: Handler = async (event) => {
  const notifications: ExpoPushMessage[] = event.notifications;

  // TODO: better error handling + where should we put this lambda?
  try {
    await new Expo().sendPushNotificationsAsync(notifications);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Nudges sent successfully" }),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send nudges" }),
    };
  }
};
