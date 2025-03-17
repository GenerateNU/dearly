import { useUserStore } from "@/auth/store";
import { useLinkingURL } from "expo-linking";

export const useInviteMember = () => {
  const deeplink = useLinkingURL();

  if (deeplink) {
    const url = new URL(deeplink);
    const params = new URLSearchParams(url.search);
    const inviteToken = params.get("token");
    return inviteToken;
  }

  return "";
};
