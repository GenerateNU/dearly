import { useUserStore } from "@/auth/store";
import { SafeAreaView } from "react-native";
import SimplePage from "@/design-system/components/shared/simple-page";
import { deleteGroup } from "@/api/group";
import { useDeleteGroup } from "@/hooks/api/group";

const DeleteGroup = () => {
  const { group } = useUserStore();
  
  const { mutate: deleteGroup, isPending, error, isError} = useDeleteGroup(group?.id as string);
  
  if (!group) return; // should never happen
  

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title="Delete Group?"
        isLoading={isPending}
        isError={isError}
        error={error}
        onPress={() => deleteGroup}
        buttonLabel="Delete Group"
        description="Deleting a group cannot be undone. All photos uploaded in this group will deleted."
      />
    </SafeAreaView>
  );
};

export default DeleteGroup;
