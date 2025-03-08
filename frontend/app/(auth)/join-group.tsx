import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { SafeAreaView } from "react-native";
import { router } from "expo-router";
import { TextButton } from "@/design-system/components/ui/text-button";

const JoinGroup = () => {
  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <Box paddingBottom="l" padding="m" justifyContent="space-between" flex={1}>
        <Box gap="l" width="100%" flex={1} justifyContent="flex-start" alignItems="flex-start">
          <Text variant="bodyLargeBold">Join Group</Text>
          <Text variant="caption">
            The only way to join a group is via link! Ask your friend/family member to share it with
            you!
          </Text>
        </Box>
        <Box width="100%" gap="m" alignItems="center" className="w-full">
          <TextButton variant="blushRounded" label="Back" onPress={() => router.back()} />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default JoinGroup;
