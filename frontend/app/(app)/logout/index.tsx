import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { SafeAreaView } from "react-native-safe-area-context";

const Logout = () => {
  const { logout } = useUserStore();

  return (
    <SafeAreaView className="flex-1">
      <Box width="100%" paddingTop="xxl" padding="m" flex={1} gap="l" alignItems="center">
        <Box width="100%" gap="s">
          <Text variant="h2">Log out?</Text>
          <Text variant="body">Are you sure you want to log out?</Text>
        </Box>
        <Box width="40%">
          <TextButton onPress={logout} label="Log out" variant="primary" />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default Logout;
