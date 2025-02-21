import { Box } from "@/design-system/base/box";
import { router } from "expo-router";
import { TextButton } from "@/design-system/components/ui/text-button";
import { SelectItem } from "@/design-system/components/ui/select";

const Index = () => {
  return (
    <Box backgroundColor="pearl" gap="m" flex={1} justifyContent="center" alignItems="center">
      <Box gap="s" width="70%">
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
          variant="blushRounded"
          label="Design System"
          onPress={() => router.push("/(auth)/design-system")}
        />
        <TextButton
          variant="blushRounded"
          label="Components Library"
          onPress={() => router.push("/(auth)/components")}
        />
      </Box>
    </Box>
  );
};

export default Index;
