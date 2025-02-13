import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const handler = async (event) => {
  const notifications = formatExpoMessage(event.notifications) || [];
  
  try {
    const receipts = await expo.sendPushNotificationsAsync(notifications);
    const failedToSend = receipts.filter((receipt) => receipt.status === "error");
    if (failedToSend.length > 0) {
     throw new Error('Failed to send.');
    }
  } catch (error) {
    const response = {
      statusCode: 500,
      body: JSON.stringify({message: `Failed to send notifications: ${error}`}),
    };
    return response;
  }
  const response = {
    statusCode: 200,
    body: JSON.stringify({message: "Successfully sent notifications schedule"}),
  };
  return response;
};

// Convert ExpoPushMessage[] to Expo notification format
function formatExpoMessage(messages) {
  const expoPushMessages = messages.map((message) => ({
    to: message.to,
    data: message.data || {},
    title: message.title,
    body: message.body,
  }));

  return expoPushMessages;
}
