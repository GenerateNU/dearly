import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { SafeAreaView } from "react-native";
import { router } from "expo-router";
import { GroupAction } from "@/types/group";
import { Card } from "@/design-system/components/shared/card";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";

const JoinCreateGroup = () => {
  const { user, setUser } = useOnboarding();

  const handleSelectAction = (action: GroupAction) => {
    setUser({ action });
  };

  const onNext = () => {
    if (user.action === GroupAction.CREATE) {
      router.push("/(auth)/group/create");
    } else {
      router.push("/(auth)/group/join");
    }
  };

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <Box paddingBottom="l" padding="m" justifyContent="space-between" flex={1}>
        <Box gap="l" width="100%" flex={1} justifyContent="flex-start" alignItems="flex-start">
          <Box gap="s">
            <Text variant="bodyLargeBold">Choose Your Experience</Text>
          </Box>

          <Box gap="m" width="100%">
            <Card
              onSelected={() => handleSelectAction(GroupAction.JOIN)}
              selected={user.action === GroupAction.JOIN}
              title={GroupAction.JOIN}
              description="Join an already created group"
            />

            <Card
              onSelected={() => handleSelectAction(GroupAction.CREATE)}
              selected={user.action === GroupAction.CREATE}
              title={GroupAction.CREATE}
              description="Start your own group & invite people"
            />
          </Box>
        </Box>
        <Box width="100%" gap="m" alignItems="center" className="w-full">
          <TextButton variant="primary" label="Next" onPress={onNext} />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default JoinCreateGroup;
