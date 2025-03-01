import * as SMS from "expo-sms";

const deeplink = "dearly://(app)/(tabs)"
const message = `invites you to join their private group on Dearly! ${deeplink}`;

/**
 * Enables sending invitation links from this user's device.
 */
export async function useInvitations(): Promise<string> {
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("SMS is not enabled on this device.");
  }
  const messageResponse = await SMS.sendSMSAsync([], message);
  return messageResponse.result
}
