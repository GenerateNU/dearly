import { useUserStore } from "@/auth/store";
import { SafeAreaView } from "react-native";
import SimplePage from "@/design-system/components/shared/simple-page";

const LeaveGroup = () => {
  const { group } = useUserStore();

  if (!group) return; // should never happen

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title="Leave Group?"
        isLoading={false}
        isError={false}
        error={new Error()}
        onPress={() => null}
        buttonLabel="Leave Group"
        description="You will no longer access your photos taken within this group nor be able to view the
            group members."
      />
    </SafeAreaView>
  );
};

export default LeaveGroup;
