import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { useCallback, useEffect, useState, memo } from "react";
import { Text } from "@/design-system/base/text";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import { useUserStore } from "@/auth/store";
import { useDisableNudge, useGroupNudgeConfig } from "@/hooks/api/nudge";
import { isNoNudgeConfig, isNudgeScheduleConfig } from "@/types/nudge";
import SaveNudgeScheduleButton from "./components/save-nudge";
import { FREQUENCY_DROPDOWN_OPTIONS } from "./constants/constants";
import Toggle from "@/design-system/components/shared/toggle";
import { useFocusEffect } from "expo-router";
import ResourceView from "@/design-system/components/utilities/resource-view";
import Spinner from "@/design-system/components/shared/spinner";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import RenderNudgeSettings from "./components/render-nudge-settings";

const FrequencyDropdown = memo(
  ({
    value,
    items,
    setValue,
    setItems,
  }: {
    value: string | null;
    items: DropdownItem[];
    setValue: React.Dispatch<React.SetStateAction<string | null>>;
    setItems: React.Dispatch<React.SetStateAction<DropdownItem[]>>;
  }) => (
    <Box gap="xs">
      <Text variant="caption">SELECT FREQUENCY</Text>
      <Dropdown
        id="frequency"
        direction="BOTTOM"
        placeholder="Select frequency"
        value={value}
        items={items}
        setValue={setValue}
        setItems={setItems}
      />
    </Box>
  ),
);

FrequencyDropdown.displayName = "FrequencyDropdown";

const NudgeSettingsContent = memo(
  ({
    frequencySettings,
    dayOfWeekSettings,
    dayOfMonthSettings,
    daysOfWeekArr,
    setDayOfWeek,
    setDayOfMonth,
    setDaysOfWeekArr,
  }: {
    frequencySettings: string | null;
    dayOfWeekSettings: string | null;
    dayOfMonthSettings: string | null;
    daysOfWeekArr: string[] | null;
    setDayOfWeek: React.Dispatch<React.SetStateAction<string | null>>;
    setDaysOfWeekArr: React.Dispatch<React.SetStateAction<string[] | null>>;
    setDayOfMonth: React.Dispatch<React.SetStateAction<string | null>>;
  }) => {
    return (
      <Box width="100%" alignItems="center">
        <RenderNudgeSettings
          frequency={frequencySettings}
          dayOfWeek={dayOfWeekSettings}
          setDayOfWeek={setDayOfWeek}
          daysOfWeekArr={daysOfWeekArr}
          setDaysOfWeekArr={setDaysOfWeekArr}
          dayOfMonth={dayOfMonthSettings}
          setDayOfMonth={setDayOfMonth}
        />
        <SaveNudgeScheduleButton />
      </Box>
    );
  },
);

NudgeSettingsContent.displayName = "NudgeSettingsContent";

const SuccessContent = memo(
  ({
    enable,
    frequencySettings,
    items,
    setFrequency,
    setItems,
    handleToggle,
    dayOfWeekSettings,
    dayOfMonthSettings,
    setDayOfWeek,
    setDayOfMonth,
    daysOfWeekArr,
    setDaysOfWeekArr,
  }: {
    enable: boolean;
    frequencySettings: string | null;
    items: DropdownItem[];
    setFrequency: React.Dispatch<React.SetStateAction<string | null>>;
    setItems: React.Dispatch<React.SetStateAction<DropdownItem[]>>;
    handleToggle: () => void;
    dayOfWeekSettings: string | null;
    daysOfWeekArr: string[] | null;
    dayOfMonthSettings: string | null;
    setDaysOfWeekArr: React.Dispatch<React.SetStateAction<string[] | null>>;
    setDayOfWeek: React.Dispatch<React.SetStateAction<string | null>>;
    setDayOfMonth: React.Dispatch<React.SetStateAction<string | null>>;
  }) => (
    <>
      <Text variant="bodyLargeBold">Set Recurring Nudges</Text>
      <Toggle onToggle={handleToggle} enabled={enable} label="Recurring Nudges" />
      {enable && (
        <>
          <FrequencyDropdown
            value={frequencySettings}
            items={items}
            setValue={setFrequency}
            setItems={setItems}
          />
          <NudgeSettingsContent
            daysOfWeekArr={daysOfWeekArr}
            setDaysOfWeekArr={setDaysOfWeekArr}
            frequencySettings={frequencySettings}
            dayOfWeekSettings={dayOfWeekSettings}
            dayOfMonthSettings={dayOfMonthSettings}
            setDayOfWeek={setDayOfWeek}
            setDayOfMonth={setDayOfMonth}
          />
        </>
      )}
    </>
  ),
);

SuccessContent.displayName = "SuccessContent";

const SetRecurringNudge = () => {
  const [items, setItems] = useState<DropdownItem[]>(FREQUENCY_DROPDOWN_OPTIONS);

  const {
    nudgeSettings,
    setRecurringNudge,
    frequencySettings,
    setFrequency,
    dayOfWeekSettings,
    setDayOfWeek,
    daysOfWeekArr,
    setDaysOfWeekArr,
    dayOfMonthSettings,
    setDayOfMonth,
    setNudgeAt,
  } = useNudgeSettings();
  const { group } = useUserStore();
  const { data, error, refetch, isLoading, isRefetching } = useGroupNudgeConfig(
    group?.id as string,
  );
  const { mutateAsync: disableNudge } = useDisableNudge(group?.id as string);

  const [isDefault, setIsDefault] = useState(true);
  const [enable, setEnable] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        if (isNoNudgeConfig(data)) {
          setEnable(false);
        } else if (isNudgeScheduleConfig(data) && !isDefault) {
          if (data.isActive) {
            setEnable(true);
          } else {
            setEnable(false);
          }
          setFrequency(data.frequency);
          if (data.frequency === "BIWEEKLY" && data.daysOfWeek) {
            setDayOfWeek(data.daysOfWeek[0] ?? null);
          }
          if (data.frequency === "WEEKLY" && data.daysOfWeek) {
            setDaysOfWeekArr(data.daysOfWeek);
          }
          if (data.day) setDayOfMonth(String(data.day));
          setNudgeAt(new Date(data.nudgeAt));
          setRecurringNudge(data);
        }
      } catch (error) {
        console.error("Error parsing data:", error);
      }
    }
  }, [data, isDefault]);

  useFocusEffect(
    useCallback(() => {
      setRecurringNudge(null);
      setFrequency(null);
      setDayOfWeek(null);
      setDayOfMonth(null);
      setDaysOfWeekArr(null);
      setNudgeAt(new Date());
      setIsDefault(false);
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    // Reset settings accordingly
    if (nudgeSettings?.frequency !== frequencySettings) {
      switch (frequencySettings) {
        case "BIWEEKLY":
          setDaysOfWeekArr(null);
        case "WEEKLY":
          setDayOfWeek(null);
          setDayOfMonth(null);
          break;
        case "MONTHLY":
          setDayOfWeek(null);
          setDaysOfWeekArr(null);
          break;
        case "DAILY":
          setDayOfWeek(null);
          setDaysOfWeekArr(null);
          setDayOfMonth(null);
          break;
        default:
          break;
      }
    }
  }, [frequencySettings]);

  useEffect(() => {
    if (dayOfWeekSettings) {
      setDaysOfWeekArr([dayOfWeekSettings]);
    }
  }, [dayOfWeekSettings]);

  const handleToggle = useCallback(async () => {
    if (enable) {
      await disableNudge(group?.id as string);
      setEnable(false);
    } else {
      setEnable(true);
    }
  }, [enable, disableNudge, group?.id]);

  if (!group) {
    return null;
  }

  const nudgeState = {
    loading: isLoading || isRefetching,
    error: error ? error.message : null,
    data,
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
        <ResourceView
          resourceState={nudgeState}
          successComponent={
            <SuccessContent
              enable={enable}
              daysOfWeekArr={daysOfWeekArr}
              setDaysOfWeekArr={setDaysOfWeekArr}
              frequencySettings={frequencySettings}
              items={items}
              setFrequency={setFrequency}
              setItems={setItems}
              handleToggle={handleToggle}
              dayOfWeekSettings={dayOfWeekSettings}
              dayOfMonthSettings={dayOfMonthSettings}
              setDayOfWeek={setDayOfWeek}
              setDayOfMonth={setDayOfMonth}
            />
          }
          loadingComponent={
            <Box width="100%" flex={1} alignItems="center">
              <Spinner />
            </Box>
          }
          errorComponent={<ErrorDisplay refresh={refetch} />}
        />
      </Box>
    </SafeAreaView>
  );
};

export default SetRecurringNudge;
