import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { SafeAreaView } from "react-native-safe-area-context";

const NudgeMember = () => {
  const { group } = useUserStore();

  if (!group) return;

  return (
    <SafeAreaView className="flex-1">
      <Box
        width="100%"
        paddingTop="xl"
        padding="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Text variant="bodyLargeBold">{group.name}</Text>
      </Box>
    </SafeAreaView>
  );
};

export default NudgeMember;
