import { useUserStore } from "@/auth/store";
import { SafeAreaView } from "react-native";
import SimplePage from "@/design-system/components/shared/simple-page";

const RemoveMember = () => {
  const { group } = useUserStore();

  if (!group) return; // should never happen

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title="Remove From the Group?"
        isLoading={false}
        isError={false}
        error={new Error()}
        onPress={() => null}
        buttonLabel="Remove From Group"
        description="The user will be removed from the group and will no longer access their photos taken
            within this group nor be able to view the group members."
      />
    </SafeAreaView>
  );
};

export default RemoveMember;
