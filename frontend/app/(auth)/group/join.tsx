import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { SafeAreaView } from "react-native";
import { useUserStore } from "@/auth/store";
import { router } from "expo-router";
import BackNextButtons from "@/design-system/components/shared/buttons/back-next-buttons";
import { useOnboarding } from "@/contexts/onboarding";
import { useEffect } from "react";

const JoinGroup = () => {
  const { finishOnboarding } = useUserStore();
  const { setPage } = useOnboarding();

  useEffect(() => {
    setPage(4);
  }, []);

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <Box flex={1} paddingBottom="l" padding="m" justifyContent="space-between">
        <Box gap="l" width="100%">
          <Text variant="bodyLargeBold">Join Group</Text>
          <Text variant="caption">
            The only way to join a group is via link! Ask your friend/family member to share it with
            you!
          </Text>
        </Box>
        <Box width="100%" gap="m" alignItems="center" className="w-full">
          <BackNextButtons
            nextLabel="Skip"
            onNext={finishOnboarding}
            onPrev={() => router.back()}
          />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default JoinGroup;
