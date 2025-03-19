import { useUserStore } from "@/auth/store";
import { SafeAreaView } from "react-native";
import SimplePage from "@/design-system/components/shared/simple-page";

const DeleteGroup = () => {
  const { group } = useUserStore();

  if (!group) return; // should never happen

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title="Delete Group?"
        isLoading={false}
        isError={false}
        error={new Error()}
        onPress={() => null}
        buttonLabel="Delete Group"
        description="Deleting a group cannot be undone. All photos uploaded in this group will deleted."
      />
    </SafeAreaView>
  );
};

export default DeleteGroup;
