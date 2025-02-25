import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Card } from "@/design-system/components/ui/card";
import { SafeAreaView } from "react-native";
import { Mode } from "@/types/mode";
import { TextButton } from "@/design-system/components/ui/text-button";

const SelectMode = () => {
  const { user, setUser, page, setPage } = useOnboarding();

  const handleSelectMode = (selectedMode: Mode) => {
    setUser({ mode: selectedMode });
  };

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <Box paddingBottom="l" padding="m" justifyContent="space-between" flex={1}>
        <Box gap="l" width="100%" flex={1} justifyContent="flex-start" alignItems="flex-start">
          <Box gap="s">
            <Text variant="bodyLargeBold">Which version of the app would you like?</Text>
            <Text variant="caption">(You can change this later in the settings)</Text>
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
        <Box gap="m" alignItems="center" className="w-full">
          <TextButton variant="blushRounded" label="Back" onPress={() => setPage(page - 1)} />
          <TextButton variant="honeyRounded" label="Next" onPress={() => setPage(page + 1)} />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default SelectMode;
