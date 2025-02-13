export const getSlackMessage = (slackId: string) => {
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
        text: `Please check your mailbox for an email from TestFlight and install the build on your phone! 📲✨`,
      },
    },
  ];

  return message;
};
