import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Alert, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";
import BottomSheet from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import BackNextButtons from "@/design-system/components/shared/buttons/back-next-buttons";
import Input from "@/design-system/components/shared/controls/input";
import SelectBirthdayPopup from "../components/birthday-popup";
import { formatBirthday } from "@/utilities/birthday";

const Birthday = () => {
  const { user, setIsCreatingProfile, isCreatingProfile, setPage, page } = useOnboarding();
  const { register, error, isAuthenticated } = useUserStore();
  const birthdayRef = useRef<BottomSheet>(null);

  const createProfile = async () => {
    setIsCreatingProfile(true);

    const processedBirthday = user.birthday
      ? new Date(
          Date.UTC(
            user.birthday.getFullYear(),
            user.birthday.getMonth(),
            user.birthday.getDate(),
            12,
            0,
            0,
          ),
        )
      : null;

    await register({
      ...user,
      birthday: processedBirthday,
    });

    if (error) return;

    if (isAuthenticated) {
      router.push(`/(auth)/group`);
    }
    setIsCreatingProfile(false);
  };

  useEffect(() => {
    const reroute = (message: string) => {
      Alert.alert(
        "Failed to create your profile. Please try again.", // Title of the alert
        message, // Message body of the alert
        [
          {
            text: "OK",
            onPress: () => {
              router.push(`/(auth)`);
            },
          },
        ],
        { cancelable: false },
      );
    };

    if (error) {
      reroute(error);
    }
  }, [error]);

  const onPrev = () => {
    setPage(page - 1);
    router.back();
  };

  return (
    <>
      <SafeAreaView className="flex-1 mt-[25%]">
        <Box flex={1} paddingBottom="l" padding="m" justifyContent="space-between">
          <Box gap="l" width="100%">
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
      </SafeAreaView>
      <SelectBirthdayPopup ref={birthdayRef} />
    </>
  );
};

export default Birthday;
