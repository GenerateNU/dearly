import Box from "@/design-system/base/box";
import Button from "@/design-system/components/button";
import { router } from "expo-router";

const Index = () => {
  return (
    <Box backgroundColor="primary" gap="m" flex={1} justifyContent="center" alignItems="center">
      <Button label="Login" onPress={() => router.push("/(auth)/login")} />
      <Button label="Register" onPress={() => router.push("/(auth)/register")} />
    </Box>
  );
};

export default Index;
