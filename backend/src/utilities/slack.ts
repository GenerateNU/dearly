export const getSlackMessage = (buildUrl: string, qrCodeUrl: string, slackId: string) => {
  const message = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Hey <!subteam^${slackId}> designers and engineers 💛\n\nA new iOS build of Dearly is now ready for UI/UX testing!\n\n`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `You can access the build in two ways:\n• <${buildUrl}|Click here to download directly> ✨\n• Scan the QR code below 📲\n`,
      },
    },
    {
      type: "image",
      title: {
        type: "plain_text",
        text: `QR Code for iOS Build`,
      },
      image_url: qrCodeUrl,
      alt_text: "QR Code for the build URL",
    },
  ];

  return message;
};
