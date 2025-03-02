import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/ui/text-button";
import { Alert, SafeAreaView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";

const Birthday = () => {
  const { user, setUser, setIsCreatingProfile, isCreatingProfile } = useOnboarding();
  const { register, error, isAuthenticated } = useUserStore();

  const createProfile = async () => {
    setIsCreatingProfile(true);

    try {
      await register(user);
      if (error) {
        reroute(error);
      }
      if (isAuthenticated) {
        router.push(`/(app)/(tabs)`);
      }
      setIsCreatingProfile(false);
    } catch (error: unknown) {
      let errorMessage = "Failed to create profile. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Failed to create profile. ${error.message} Please try again.`;
      }
      reroute(errorMessage);
    }
  };

  // Route to correct page upon error
  const reroute = (message: string) => {
    Alert.alert(
      "Failed to create your profile.", // Title of the alert
      message, // Message body of the alert
      [
        {
          text: "OK",
          onPress: () => router.push(`/(auth)/register`),
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <Box flex={1} justifyContent="space-between" flexDirection="column" padding="m">
        <Box gap="s" className="w-full" justifyContent="flex-start" alignItems="flex-start">
          <Text variant="bodyLargeBold">Add your birthday</Text>
          <Text variant="caption">
            Enter your birthdate below to help us ensure your safety and provide the best experience
            tailored to you. Your information will remain private and won’t appear on your public
            profile.
          </Text>
          <DateTimePicker
            onChange={(_, date) => setUser({ birthday: date })}
            textColor="black"
            display="spinner"
            value={user.birthday || new Date()}
            mode="date"
          />
        </Box>
        <Box gap="m" alignItems="center" className="w-full">
          <TextButton
            variant="honeyRounded"
            label={isCreatingProfile ? "Creating Profile..." : "Create Profile"}
            disabled={isCreatingProfile}
            onPress={() => createProfile()}
          />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default Birthday;
