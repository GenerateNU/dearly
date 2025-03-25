import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { useEffect, useRef, useState } from "react";
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
import {
  FREQUENCY_LABEL_MAPPING,
  FREQUENCY_OPTIONS,
  MONTHLY_OPTIONS,
  WEEKLY_OPTIONS,
  WEEKLY_OPTIONS_MAPPING,
} from "./constants/constants";

const SetRecurringNudge = () => {
  const [items, setItems] = useState<DropdownItem[]>(
    FREQUENCY_OPTIONS.map((item) => ({ value: item, label: item })),
  );

  const {
    nudgeSettings,
    setRecurringNudge,
    frequencySettings,
    setFrequency,
    dayOfWeekSettings,
    setDayOfWeek,
    dayOfWeek2Settings,
    setDayOfWeek2,
    dayOfMonthSettings,
    setDayOfMonth,
    setNudgeAt,
  } = useNudgeSettings();
  const { group } = useUserStore();
  const { data, isPending, error, isError } = useGroupNudgeConfig(group.id);

  useEffect(() => {
    // Initialize previous nudge settings
    if (!isPending && !isError && data && !nudgeSettings) {
      console.log(`Data: ${JSON.stringify(data)}`);
      // TODO: deal with disable
      setFrequency(FREQUENCY_LABEL_MAPPING[data.frequency as keyof typeof FREQUENCY_LABEL_MAPPING]);
      if (data.daysOfWeek && data.daysOfWeek.length > 0) {
        setDayOfWeek(
          WEEKLY_OPTIONS_MAPPING[data.daysOfWeek[0] as keyof typeof WEEKLY_OPTIONS_MAPPING],
        );
        if (data.daysOfWeek.length == 2) {
          setDayOfWeek2(
            WEEKLY_OPTIONS_MAPPING[data.daysOfWeek[1] as keyof typeof WEEKLY_OPTIONS_MAPPING],
          );
        }
      }
      setDayOfMonth(data.day);
      setNudgeAt(new Date(data.nudgeAt));
      setRecurringNudge(data);
    }
  }, [data]);

  useEffect(() => {
    // Reset settings accordingly
    if (nudgeSettings) {
      switch (frequencySettings) {
        case "Weekly":
        case "Biweekly":
          setDayOfWeek2(null);
        case "Twice a Week":
          setDayOfMonth(null);
          console.log(dayOfWeekSettings);
          break;
        case "Monthly":
          setDayOfWeek(null);
          break;
        case "Daily":
          setDayOfWeek(null);
          setDayOfWeek2(null);
          setDayOfMonth(null);
          break;
        default:
          break;
      }
    }
  }, [frequencySettings, data]);

  // Render setting view based on frequency
  const renderSettings = () => {
    switch (frequencySettings) {
      case "Disabled":
        return <></>;
      case "Daily":
        return <NudgeAtTimePicker />;
      case "Weekly":
        return (
          <NudgeSettings
            options={WEEKLY_OPTIONS}
            curOption={dayOfWeekSettings}
            setOption={setDayOfWeek}
          />
        );
      case "Twice a Week": //TODO:
        return (
          <>
            <Box>
              <Text>First Nudge</Text>
              <NudgeSettings
                options={WEEKLY_OPTIONS}
                curOption={dayOfWeekSettings}
                setOption={setDayOfWeek}
              />
            </Box>
          </>
        );
      case "Biweekly":
        return (
          <NudgeSettings
            options={WEEKLY_OPTIONS}
            curOption={dayOfWeekSettings}
            setOption={setDayOfWeek}
          />
        );
      case "Monthly":
        return (
          <NudgeSettings
            options={MONTHLY_OPTIONS}
            curOption={dayOfMonthSettings}
            setOption={setDayOfMonth}
          />
        );
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
          value={frequencySettings}
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
