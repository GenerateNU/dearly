import { useUserStore } from "@/auth/store";
import { SafeAreaView } from "react-native";
import SimplePage from "@/design-system/components/shared/simple-page";
import { useDeleteGroup } from "@/hooks/api/group";
import { router } from "expo-router";
import { useEffect } from "react";

const DeleteGroup = () => {
  const { group, setSelectedGroup } = useUserStore();

  const { mutateAsync: mutateGroup, isPending, error, isError, isSuccess } = useDeleteGroup();

  useEffect(() => {
    if (isSuccess) {
      setSelectedGroup(null);
      router.push("/(app)/(tabs)");
    }
  }, [isSuccess, setSelectedGroup]);

  const deleteGroup = async () => {
    if (group?.id) {
      await mutateGroup(group.id);
    }
  };

  if (!group) return null;

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
