import { Box } from "@/design-system/base/box";
import { router } from "expo-router";
import { TextButton } from "@/design-system/components/ui/text-button";

const Index = () => {
  return (
    <Box backgroundColor="pearl" gap="m" flex={1} justifyContent="center" alignItems="center">
      <Box gap="s" width="50%">
        <TextButton
          variant="honeyRounded"
          label="Login"
          onPress={() => router.push("/(auth)/login")}
        />
        <TextButton
          variant="honeyRounded"
          label="Register"
          onPress={() => router.push("/(auth)/register")}
        />
        <TextButton
          variant="honeyRounded"
          label="Components"
          onPress={() => router.push("/(auth)/demo")}
        />
      </Box>
    </Box>
  );
};

export default Index;
