import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Avatar } from "@/design-system/components/ui/avatar";
import { TextButton } from "@/design-system/components/ui/text-button";
import { SafeAreaView } from "react-native";

const Birthday = () => {
  const { user, setUser, page, setPage } = useOnboarding();

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <Box
        flex={1}
        justifyContent="space-between"
        flexDirection="column"
        padding="m"
        paddingBottom="l"
      >
        <Box gap="s" className="w-full" justifyContent="flex-start" alignItems="flex-start">
          <Text variant="bodyLargeBold">Add your birthday</Text>
          <Text variant="caption">
            Enter your birthdate below to help us ensure your safety and provide the best experience
            tailored to you. Your information will remain private and won’t appear on your public
            profile.
          </Text>
        </Box>
        <Box gap="m" alignItems="center" className="w-full">
          <TextButton variant="blushRounded" label="Back" onPress={() => setPage(page - 1)} />
          <TextButton
            variant="honeyRounded"
            label="Create Profile"
            onPress={() => setPage(page + 1)}
          />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default Birthday;
