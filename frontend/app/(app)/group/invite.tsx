import InviteLinkComponent from "@/design-system/components/groups/invite-group";
import { router } from "expo-router";
import { SafeAreaView } from "react-native";

const InviteLink = () => {
  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <InviteLinkComponent nextPageNavigate={() => router.push("/(app)/(tabs)")} />
    </SafeAreaView>
  );
};

export default InviteLink;
