import { useUserStore } from "@/auth/store";
import SimplePage from "@/design-system/components/shared/simple-page";
import { useUpdateUser } from "@/hooks/api/user";
import { useIsBasicMode } from "@/hooks/component/mode";
import { Mode } from "@/types/mode";
import { router } from "expo-router";
import { SafeAreaView } from "react-native";

const SwitchMode = () => {
  const { userId, setMode } = useUserStore();
  const isBasic = useIsBasicMode();
  const { mutateAsync, isPending, error, isError } = useUpdateUser(userId!);

  const switchModeLabel = `Switch to ${isBasic ? "Advanced" : "Basic"}`;

  const switchModeOnPress = async () => {
    const modeToSwitch = isBasic ? Mode.ADVANCED : Mode.BASIC;
    await mutateAsync({ mode: modeToSwitch });
    setMode(modeToSwitch);
    router.navigate("/(app)/(tabs)");
  };

  const message = isBasic
    ? "The advanced version of Dearly offers additional features and customization options. It's designed for experienced users who want more control and functionality."
    : "The basic version of Dearly is simple and easy to use. It's built for beginners or those who prefer a more straightforward interface.";

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title={switchModeLabel}
        isLoading={isPending}
        isError={isError}
        error={error}
        onPress={switchModeOnPress}
        buttonLabel={switchModeLabel}
        description={message}
      />
    </SafeAreaView>
  );
};

export default SwitchMode;
