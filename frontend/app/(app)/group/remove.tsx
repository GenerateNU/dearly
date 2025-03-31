import { useUserStore } from "@/auth/store";
import { SafeAreaView } from "react-native";
import SimplePage from "@/design-system/components/shared/simple-page";
import { useRemoveMemberContext } from "@/contexts/remove-member";
import { useRemoveMember } from "@/hooks/api/member";
import { router } from "expo-router";
import { useEffect } from "react";

const RemoveMember = () => {
  const { group } = useUserStore();
  const { user, setUser } = useRemoveMemberContext();

  const {
    mutateAsync: remove,
    isPending,
    error,
    isError,
    isSuccess,
  } = useRemoveMember(group?.id as string);

  useEffect(() => {
    if (isSuccess) {
      setUser(null);
      router.back();
    }
  }, [isSuccess]);

  const removeMember = async () => {
    if (user?.id && group?.id) {
      await remove(user.id);
    }
  };

  if (!group) return null; // should never happen

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title="Remove From the Group?"
        isLoading={isPending}
        isError={isError}
        error={error}
        onPress={removeMember}
        buttonLabel="Remove From Group"
        description="The user will be removed from the group and will no longer access their photos taken
            within this group nor be able to view the group members."
      />
    </SafeAreaView>
  );
};

export default RemoveMember;
