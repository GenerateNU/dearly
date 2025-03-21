import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { useEffect, useState } from "react";
import { Text } from "@/design-system/base/text";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import NudgeSettings from "./components/nudge-settings";
import NudgeAtTimePicker from "./components/nudge-time-settings";
import { getAuthToken } from "@/utilities/auth-token";
import { getAutoNudgeSchedule } from "@/api/nudge";
import { useUserStore } from "@/auth/store";
import { useGroupNudgeConfig, useUpdateNudgeConfig } from "@/hooks/api/nudge";
import { ConfigNudgeSchedulePayload } from "@/types/nudge";
import SaveNudgeScheduleButton from "./components/save-nudge";

const WEEKLY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MONTHLY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const FREQUENCY_OPTIONS = ["Disabled", "Daily", "Twice a Week", "Weekly", "Biweekly", "Monthly"];

const SetRecurringNudge = () => {
  const [items, setItems] = useState<DropdownItem[]>(
    FREQUENCY_OPTIONS.map((item) => ({ value: item, label: item })),
  );

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
  console.log(group);
  console.log(group.id);
  const { data, isPending, error } = useGroupNudgeConfig(group.id);

  useEffect(() => {
    if (data && !(frequency || dayOfWeek || dayOfMonth || nudgeAt)) {
      setFrequency(data.frequency ?? null);
      setDayOfWeek(data.dayOfWeek ?? null);
      setDayOfMonth(data.dayOfMonth ?? null);
      setNudgeAt(data.nudgeAt ?? null);
    }
  });

  const renderSettings = () => {
    switch (frequency) {
      case "Disabled":
        return <></>;
      case "Daily":
        return <NudgeAtTimePicker />;
      case "Weekly":
        return (
          <NudgeSettings options={WEEKLY_OPTIONS} curOption={dayOfWeek} setOption={setDayOfWeek} />
        );
      case "Twice a Week":
        return (
          <>
            <Box>
              <Text>First Nudge</Text>
              <NudgeSettings
                options={WEEKLY_OPTIONS}
                curOption={dayOfWeek}
                setOption={setDayOfWeek}
              />
            </Box>
            <Box>
              <Text>Second Nudge</Text>
              <NudgeSettings
                options={WEEKLY_OPTIONS}
                curOption={dayOfWeek}
                setOption={setDayOfWeek}
              />
            </Box>
          </>
        );
      case "Biweekly":
        return (
          <NudgeSettings options={WEEKLY_OPTIONS} curOption={dayOfWeek} setOption={setDayOfWeek} />
        );
      case "Monthly":
        return (
          <NudgeSettings
            options={MONTHLY_OPTIONS}
            curOption={String(dayOfMonth)}
            setOption={setDayOfWeek}
          />
        ); // TODO: Update to generic type to accept number options
      default:
        return <></>;
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <Box
        width="100%"
        paddingTop="xl"
        padding="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
        gap="m"
      >
        <Text variant="bodyLargeBold">Set Recurring Nudges</Text>
        <Text variant="caption">SELECT FREQUENCY</Text>
        <Dropdown
          direction="BOTTOM"
          value={frequency}
          items={items}
          setValue={setFrequency}
          setItems={setItems}
        />
        <Box width="100%" alignItems="center">
          {renderSettings()}
          <SaveNudgeScheduleButton />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default SetRecurringNudge;
