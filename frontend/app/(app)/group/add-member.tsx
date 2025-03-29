import { useGetInviteToken } from "@/hooks/api/group";
import { SafeAreaView } from "react-native";
import { useUserStore } from "@/auth/store";
import { showSharePopup } from "@/utilities/invite";
import SimplePage from "@/design-system/components/shared/simple-page";

const AddMember = () => {
  const { group } = useUserStore();
  const { data, isLoading, isError, error } = useGetInviteToken(group?.id as string);

  if (!group) return null; // should never happen

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title={`Add Member to ${group.name}`}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onPress={() => showSharePopup(data?.token)}
        buttonLabel="Copy Link"
        description="Share the link with your friends and family for them to join your group!"
      />
    </SafeAreaView>
  );
};

export default AddMember;
