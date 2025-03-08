import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Alert, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";
import BackNextButtons from "./components/buttons";
import Input from "@/design-system/components/ui/input";
import SelectBirthdayPopup from "./components/birthday-popup";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";

const formatBirthday = (birthday?: Date | null) => {
  if (!birthday) {
    return "MM/DD/YYYY";
  }

  const date = new Date(birthday);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

const Birthday = () => {
  const { user, setIsCreatingProfile, isCreatingProfile, setPage, page } = useOnboarding();
  const { register, error, isAuthenticated } = useUserStore();
  const birthdayRef = useRef<BottomSheet>(null);

  const createProfile = async () => {
    setIsCreatingProfile(true);

    try {
      await register(user);
      if (error) {
        reroute(error);
      }
      if (isAuthenticated) {
        router.push(`/(auth)/group`);
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

  const onPrev = () => {
    setPage(page - 1);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <Box flex={1} justifyContent="space-between" flexDirection="column" padding="m">
        <Box gap="l" className="w-full" justifyContent="flex-start" alignItems="flex-start">
          <Box flexDirection="column" gap="s">
            <Text variant="bodyLargeBold">Add your birthday</Text>
            <Text variant="caption">This information will be displayed on your profile.</Text>
          </Box>
          <Box width="100%">
            <Input
              isButton
              onPress={() => birthdayRef.current?.snapToIndex(0)}
              value={formatBirthday(user.birthday)}
              title="BIRTHDAY"
            />
          </Box>
        </Box>
        <Box gap="m" alignItems="center" className="w-full">
          <BackNextButtons
            disableNext={isCreatingProfile}
            disablePrev={isCreatingProfile}
            onPrev={onPrev}
            onNext={createProfile}
          />
        </Box>
      </Box>
      <SelectBirthdayPopup onClose={() => null} ref={birthdayRef} />
    </SafeAreaView>
  );
};

export default Birthday;
