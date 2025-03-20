import { useUserStore } from "@/auth/store";
import { SafeAreaView } from "react-native";
import SimplePage from "@/design-system/components/shared/simple-page";
import { useRemoveMember } from "@/hooks/api/member";
import { router } from "expo-router";
import { useEffect } from "react";

const LeaveGroup = () => {
  const { group, userId, setSelectedGroup } = useUserStore();

  const {
    mutateAsync: leaveGroup,
    isPending,
    error,
    isError,
    isSuccess,
  } = useRemoveMember(group?.id as string);

  useEffect(() => {
    if (isSuccess) {
      setSelectedGroup(null);
      router.push("/(app)/(tabs)");
    }
  }, [isSuccess, setSelectedGroup]);

  const leave = async () => {
    if (userId && group?.id) {
      await leaveGroup(userId);
    }
  };

  if (!group) return null; // should never happen

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title="Leave Group?"
        isLoading={isPending}
        isError={isError}
        error={error}
        onPress={leave}
        buttonLabel="Leave Group"
        description="You will no longer access your photos taken within this group nor be able to view the
            group members."
      />
    </SafeAreaView>
  );
};

export default LeaveGroup;
