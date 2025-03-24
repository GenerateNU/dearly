import { useUserStore } from "@/auth/store";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useDisableNudge, useUpdateNudgeConfig } from "@/hooks/api/nudge";
import { ConfigNudgeSchedulePayload } from "@/types/nudge";
import { router } from "expo-router";
import { useState } from "react";

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
    frequency,
    dayOfWeek,
    dayOfMonth,
    nudgeAt,
    isValidated,
    setIsValidated,
    validationMessage,
    setValidationMessage,
  } = useNudgeSettings();
  const { group } = useUserStore();
  const { mutate, isPending, error, isError } = useUpdateNudgeConfig(group.id);
  const disableNudgeHook = useDisableNudge(group.id);
  const [isDisabled, setIsDisabled] = useState(false);

  const validate = () => {
    // TODO: validate for each frequency and create appropriate message
    if (!nudgeAt) {
      // Should not happen
      setIsValidated(false);
      setValidationMessage("No time set");
    }

    setIsValidated(true); // TODO: if statement for if all valid values
  };

  const isMissingFields = () => {
    if (frequency && frequency !== "Disabled") {
      if (!nudgeAt) return true;
      switch (frequency) {
        case "Daily":
          return false;
        case "Weekly":
          return !dayOfWeek;
        case "Twice a week":
          return !dayOfWeek;
        case "Biweekly":
          return !dayOfWeek;
        case "Monthly":
          return !dayOfMonth;
      }
    }

    return false;
  };

  // Sets the schedule
  const onPress = async () => {
    setIsDisabled(true);
    if (frequency === "Disabled") {
      await disableNudgeHook.mutate(group.id);
    } else {
      validate();
      if (isValidated && frequency) {
        const payload: ConfigNudgeSchedulePayload = {
          group: group,
          frequency: FREQUENCY_LABEL_MAPPING[frequency],
          dayOfWeek: dayOfWeek,
          day: dayOfMonth,
          nudgeAt: nudgeAt,
        };
        const data = await mutate(payload);
      }
      setIsDisabled(false);
      router.back();
    }
  };

  return (
    <Box width="25%">
      <TextButton
        onPress={onPress}
        label="Save"
        variant="primary"
        disabled={isMissingFields() || isDisabled}
      />
      {validationMessage && <Text color="warning">Error: {validationMessage}</Text>}
    </Box>
  );
};

export default SaveNudgeScheduleButton;
