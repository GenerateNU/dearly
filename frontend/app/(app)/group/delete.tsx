import { useUserStore } from "@/auth/store";
import { SafeAreaView } from "react-native";
import SimplePage from "@/design-system/components/shared/simple-page";
import { router } from "expo-router";
import { useDeleteGroup } from "@/hooks/api/group";

const DeleteGroup = () => {
  const { group, setSelectedGroup } = useUserStore();
  
  const { mutate: mutateGroup, isPending, error, isError} = useDeleteGroup();

  const deleteGroup = () => {
    mutateGroup(group?.id as String);
    router.back();
    router.back();
    setSelectedGroup(null);
  }
  
  if (!group) return; // should never happen
  

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title="Delete Group?"
        isLoading={isPending}
        isError={isError}
        error={error}
        onPress={deleteGroup}
        buttonLabel="Delete Group"
        description="Deleting a group cannot be undone. All photos uploaded in this group will deleted."
      />
    </SafeAreaView>
  );
};

export default DeleteGroup;
