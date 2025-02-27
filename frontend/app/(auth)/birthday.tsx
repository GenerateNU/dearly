import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/ui/text-button";
import { Alert, SafeAreaView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";
import { uploadUserMedia } from "@/api/media";
import * as ImageManipulator from "expo-image-manipulator";

// Function to convert URI to Blob
const uriToBlob = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

const Birthday = () => {
  const { user, setUser, setIsCreatingProfile, isCreatingProfile } = useOnboarding();
  const { register, error, isAuthenticated } = useUserStore();

  const convertToJpeg = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 0.8,
    });
    return result.uri;
  };

  const createProfile = async () => {
    setIsCreatingProfile(true);

    if (user.profilePhoto) {
      try {
        // Convert the photo to JPEG (you can use PNG if preferred)
        const jpegUri = await convertToJpeg(user.profilePhoto);

        // Convert the JPEG image to a Blob
        const profilePhotoBlob = await uriToBlob(jpegUri);

        // Create FormData and append the file
        const formData = new FormData();
        formData.append("media", profilePhotoBlob, "profilePhoto.jpg");

        // Upload the media
        await uploadUserMedia(formData);
      } catch (err) {
        console.error("Error processing the profile photo:", err);
        setIsCreatingProfile(false);
        return;
      }
    }

    try {
      // Register the user and handle any errors
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
