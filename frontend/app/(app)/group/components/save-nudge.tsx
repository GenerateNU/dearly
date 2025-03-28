import { useUserStore } from "@/auth/store";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useUpdateNudgeConfig } from "@/hooks/api/nudge";
import { ConfigNudgeSchedulePayload } from "@/types/nudge";
import { router } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

const SaveNudgeScheduleButton = () => {
  const {
    setPreviousFrequency,
    frequencySettings,
    setFrequency,
    setDayOfWeek,
    daysOfWeekArr,
    setDaysOfWeekArr,
    dayOfMonthSettings,
    setDayOfMonth,
    nudgeAtSettings,
    setNudgeAt,
  } = useNudgeSettings();
  const { group } = useUserStore();
  const { mutate, isPending, error, isSuccess } = useUpdateNudgeConfig(group?.id as string);

  const isMissingFields = () => {
    // Check if any fields are null
    if (!nudgeAtSettings) return true;
    switch (frequencySettings) {
      case "DAILY":
        return false;
      case "WEEKLY":
        return daysOfWeekArr ? daysOfWeekArr.length == 0 : true;
      case "BIWEEKLY":
        return daysOfWeekArr ? daysOfWeekArr.length == 0 : true;
      case "MONTHLY":
        return !dayOfMonthSettings;
      default:
        return true;
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (isSuccess) {
        resetSettings();
        router.back();
      }
    }
  }, [isPending, isSuccess]);

  // reset all values to null
  const resetSettings = () => {
    setPreviousFrequency(null);
    setFrequency(null);
    setDayOfWeek(null);
    setDaysOfWeekArr(null);
    setDayOfMonth(null);
    setNudgeAt(null);
  };

  useEffect(() => {
    if (error) {
      Alert.alert("Error", "Failed to update nudge schedule. Please try again.", [{ text: "OK" }]);
    }
  }, [error]);

  // Sets the schedule
  const onPress = async () => {
    if (frequencySettings) {
      const payload: ConfigNudgeSchedulePayload = {
        group: group?.id as string,
        frequency: frequencySettings,
        daysOfWeek: daysOfWeekArr,
        day: dayOfMonthSettings ? Number(dayOfMonthSettings) : null,
        nudgeAt: nudgeAtSettings?.toUTCString(),
      };
      mutate(payload);
    }
  };

  return (
    <Box width="25%">
      <TextButton
        onPress={onPress}
        label="Save"
        variant="primary"
        disabled={isMissingFields() || isPending}
      />
    </Box>
  );
};

export default SaveNudgeScheduleButton;
