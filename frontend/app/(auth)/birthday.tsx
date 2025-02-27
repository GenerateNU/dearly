import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/ui/text-button";
import { Alert, SafeAreaView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { createUser } from "../../api/user";
import { router } from "expo-router";
import { useUserState } from "@/auth/provider";
import { useUserStore } from "@/auth/store";

const Birthday = () => {
  const { user, setUser } = useOnboarding();

  const { register, error } = useUserStore();

  const [profileCreating, setProfileCreating] = useState(false);

  const createProfile = async () => {
    setProfileCreating(true);

    try {
      // TODO:
      console.log("Registering user...");
      await register(user);
      console.log(`Error: ${error}`);
      if (!error as unknown) {
        router.push(`/(app)/(tabs)`);
      } else {
        let errorMessage = "Failed to create profile. Please try again.";
        reroute(errorMessage);
      }
      setProfileCreating(false);
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
      "Error Creating Profile.", // Title of the alert
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
            label={profileCreating ? "Creating Profile..." : "Create Profile"}
            disabled={profileCreating}
            onPress={() => createProfile()}
          />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default Birthday;
