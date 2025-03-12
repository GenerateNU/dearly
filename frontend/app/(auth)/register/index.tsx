import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { SafeAreaView } from "react-native";
import { Mode } from "@/types/mode";
import { router } from "expo-router";
import { Card } from "@/design-system/components/shared/card";
import BackNextButtons from "@/design-system/components/shared/buttons/back-next-buttons";

const SelectMode = () => {
  const { user, setUser, setPage, reset } = useOnboarding();

  const handleSelectMode = (selectedMode: Mode) => {
    setUser({ mode: selectedMode });
  };

  const onNext = () => {
    setPage(2);
    router.push("/(auth)/register/signup");
  };

  const onPrev = () => {
    setPage(0);
    reset();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <Box flex={1} paddingBottom="l" padding="m" justifyContent="space-between">
        <Box gap="l" width="100%">
          <Box gap="s">
            <Text variant="bodyLargeBold">Choose Your Experience</Text>
          </Box>

          <Box gap="m" width="100%">
            <Card
              onSelected={() => handleSelectMode(Mode.BASIC)}
              selected={user.mode === Mode.BASIC}
              title="Basic"
              description="Simple and easy to use, perfect for beginners or those who prefer a straightforward interface"
            />

            <Card
              onSelected={() => handleSelectMode(Mode.ADVANCED)}
              selected={user.mode === Mode.ADVANCED}
              title="Advanced"
              description="Packed with extra features and customization options for technology lovers"
            />
          </Box>
        </Box>
        <Box width="100%" gap="m" alignItems="center" className="w-full">
          <BackNextButtons onNext={onNext} onPrev={onPrev} />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default SelectMode;
