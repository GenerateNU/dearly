import { useAuth } from "@/auth/provider";
import Box from "@/design-system/base/box";
import Button from "@/design-system/components/ui/button";
import { Mode } from "@/types/mode";
import { router } from "expo-router";
import { useState } from "react";

const Index = () => {
  const { setMode, mode } = useAuth();
  const [category, setCategory] = useState<string>("Home");

  const toggleTheme = () => {
    setMode(mode === Mode.ADVANCED ? Mode.BASIC : Mode.ADVANCED);
  };

  return (
    <Box backgroundColor="primary" gap="m" flex={1} justifyContent="center" alignItems="center">
      <Button label="Toggle Mode" onPress={toggleTheme} />
      <Button label="Login" onPress={() => router.push("/(auth)/login")} />
      <Button label="Register" onPress={() => router.push("/(auth)/register")} />
    </Box>
  );
};

export default Index;
