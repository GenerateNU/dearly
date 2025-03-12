import * as SMS from "expo-sms";

/**
 * Enables sending invitation links from this user's device.
 */
export async function useInvitations(): Promise<string> {
  const deeplink = process.env.EXPO_PUBLIC_API_BASE_URL;
  const message = `invites you to join their private group on Dearly! ${deeplink}`;
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("SMS is not enabled on this device.");
  }
  const messageResponse = await SMS.sendSMSAsync([], message);
  return messageResponse.result;
}
