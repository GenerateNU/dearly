import { useUserStore } from "@/auth/store";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useDisableNudge, useUpdateNudgeConfig } from "@/hooks/api/nudge";
import { ConfigNudgeSchedulePayload } from "@/types/nudge";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { convertData } from "../constants/constants";
import { Alert } from "react-native";

const FREQUENCY_LABEL_MAPPING = {
  Daily: "DAILY",
  Weekly: "WEEKLY",
  Biweekly: "BIWEEKLY",
  Monthly: "MONTHLY",
};

const WEEKLY_LABEL_MAPPING = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};

const SaveNudgeScheduleButton = () => {
  const {
    setRecurringNudge,
    frequencySettings,
    setFrequency,
    dayOfWeekSettings,
    setDayOfWeek,
    dayOfWeek2Settings,
    setDayOfWeek2,
    dayOfMonthSettings,
    setDayOfMonth,
    nudgeAtSettings,
    setNudgeAt,
  } = useNudgeSettings();
  const { group } = useUserStore();
  const { mutate, isPending, error, isError, isSuccess } = useUpdateNudgeConfig(
    group?.id as string,
  );
  const disableNudgeHook = useDisableNudge(group?.id as string);
  const [isSaving, setIsSaving] = useState(false); // Controls disabled button if schedule is saving
  const [daysOfWeekArr, setDaysOfWeekArr] = useState<string[] | null>(null);

  const isMissingFields = () => {
    // Check if any fields are null
    if (frequencySettings == "Disabled") return false;
    if (!nudgeAtSettings) return true;
    switch (frequencySettings) {
      case "Daily":
        return false;
      case "Weekly":
        return !dayOfWeekSettings;
      case "Twice a week":
        return !dayOfWeekSettings;
      case "Biweekly":
        return !dayOfWeekSettings;
      case "Monthly":
        return !dayOfMonthSettings;
      default:
        return true;
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (isSuccess || disableNudgeHook.isSuccess) {
        resetSettings();
        setIsSaving(false);
        router.back();
      } else {
        console.log("Error saving changes");
      }
    }
  }, [isPending, isSuccess, disableNudgeHook.isSuccess]);

  // reset all values to null
  const resetSettings = () => {
    setRecurringNudge(null);
    setFrequency(null);
    setDayOfWeek(null);
    setDayOfWeek2(null);
    setDaysOfWeekArr(null);
    setDayOfMonth(null);
    setNudgeAt(null);
  };

  useEffect(() => {
    if (error) {
      Alert.alert("Error", "Failed to update nudge schedule. Please try again.", [{ text: "OK" }]);
    }
  }, [error]);

  useEffect(() => {
    if (isSaving) {
      if (frequencySettings) {
        const payload: ConfigNudgeSchedulePayload = {
          group: group?.id as string,
          frequency: convertData(FREQUENCY_LABEL_MAPPING, frequencySettings),
          daysOfWeek: daysOfWeekArr,
          day: dayOfMonthSettings ? Number(dayOfMonthSettings) : null,
          nudgeAt: nudgeAtSettings?.toUTCString(),
        };
        mutate(payload);
      }
    }
  }, [isSaving]);

  // Sets the schedule
  const onPress = async () => {
    setIsSaving(true);
    if (frequencySettings === "Disabled") {
      await disableNudgeHook.mutate(group?.id as string);
    } else {
      if (
        frequencySettings &&
        ["Weekly", "Twice a Week", "Biweekly"].includes(frequencySettings) &&
        dayOfWeekSettings
      ) {
        if (frequencySettings === "Twice a Week" && dayOfWeek2Settings) {
          setDaysOfWeekArr([
            convertData(WEEKLY_LABEL_MAPPING, dayOfWeekSettings),
            convertData(WEEKLY_LABEL_MAPPING, dayOfWeek2Settings),
          ]);
        } else {
          setDaysOfWeekArr([convertData(WEEKLY_LABEL_MAPPING, dayOfWeekSettings)]);
        }
      }
    }
  };

  return (
    <Box width="25%">
      <TextButton
        onPress={onPress}
        label="Save"
        variant="primary"
        disabled={isMissingFields() || isSaving}
      />
    </Box>
  );
};

export default SaveNudgeScheduleButton;
