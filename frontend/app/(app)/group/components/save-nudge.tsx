import { useUserStore } from "@/auth/store";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useDisableNudge, useUpdateNudgeConfig } from "@/hooks/api/nudge";
import { ConfigNudgeSchedulePayload } from "@/types/nudge";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { convertData } from "../constants/constants";
import { validatePathConfig } from "expo-router/build/fork/getPathFromState-forks";

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
  const { mutate, isPending, error, isError, isSuccess } = useUpdateNudgeConfig(group.id);
  const disableNudgeHook = useDisableNudge(group.id);
  const [isSaving, setIsSaving] = useState(false); // Controls disabled button if schedule is saving
  const [daysOfWeekArr, setDaysOfWeekArr] = useState<string[] | null>(null);
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        // setErrorMessage("Error saving changes. Please try again.")
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

  const validate = () => { // checks all fields are correct
    
  }

  useEffect(() => {
    if (isSaving) {
      if (frequencySettings) {
        const payload: ConfigNudgeSchedulePayload = {
          group: group.id,
          frequency: convertData(FREQUENCY_LABEL_MAPPING, frequencySettings),
          daysOfWeek: daysOfWeekArr,
          day: dayOfMonthSettings,
          nudgeAt: nudgeAtSettings?.toUTCString(),
        };

        console.log(`check payload before sending ${JSON.stringify(payload)}`)
        
        mutate(payload);
      }
    }
  }, [isSaving]);

  // Sets the schedule
  const onPress = async () => {
    setIsSaving(true);
    if (frequencySettings === "Disabled") {
      await disableNudgeHook.mutate(group.id);
    } else {
      // validate();
      console.log("setting up params");
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
      {/* {errorMessage && 
      <Text color="error">{errorMessage}</Text>} */}
    </Box>
  );
};

export default SaveNudgeScheduleButton;
