import { useUserStore } from "@/auth/store";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useUpdateNudgeConfig } from "@/hooks/api/nudge";
import { ConfigNudgeSchedulePayload } from "@/types/nudge";

const SaveNudgeScheduleButton = () => {
  const {
    frequency,
    setFrequency,
    dayOfWeek,
    setDayOfWeek,
    dayOfMonth,
    setDayOfMonth,
    nudgeAt,
    setNudgeAt,
  } = useNudgeSettings();
  const { group } = useUserStore();
  const { mutate, isPending, error, isError } = useUpdateNudgeConfig(group.id);

  // Sets the schedule
  const onPress = async () => {
    const payload: ConfigNudgeSchedulePayload = {
      group: group,
      frequency: frequency,
      dayOfWeek: dayOfWeek,
      day: dayOfMonth,
      nudgeAt: nudgeAt,
    };

    await mutate(payload);
  };

  return (
    <Box width="25%">
      <TextButton onPress={onPress} label="Save" variant="primary" />
    </Box>
  );
};

export default SaveNudgeScheduleButton;
