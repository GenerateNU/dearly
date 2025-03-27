import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { useCallback, useEffect, useState, memo, SetStateAction } from "react";
import { Text } from "@/design-system/base/text";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import { useUserStore } from "@/auth/store";
import { useDisableNudge, useGroupNudgeConfig } from "@/hooks/api/nudge";
import { isNoNudgeConfig, isNudgeScheduleConfig } from "@/types/nudge";
import SaveNudgeScheduleButton from "./components/save-nudge";
import {
  FREQUENCY_DROPDOWN_OPTIONS,
} from "./constants/constants";
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
    setDayOfWeek,
    setDayOfMonth,
  }: {
    frequencySettings: string | null;
    dayOfWeekSettings: string | null;
    dayOfWeek2Settings: string | null;
    dayOfMonthSettings: string | null;
    setDayOfWeek: React.Dispatch<React.SetStateAction<string | null>>;
    setDayOfWeek2: React.Dispatch<React.SetStateAction<string | null>>;
    setDayOfMonth: React.Dispatch<React.SetStateAction<string | null>>;
  }) => {
    

    return (
      <Box width="100%" alignItems="center">
        <RenderNudgeSettings frequency={frequencySettings} dayOfWeek={dayOfWeekSettings} setDayOfWeek={setDayOfWeek} daysOfWeekArr={null} setDaysOfWeekArr={function (value: SetStateAction<string[] | null>): void {
          throw new Error("Function not implemented.");
        } } dayOfMonth={dayOfMonthSettings} setDayOfMonth={setDayOfMonth} />
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
    dayOfWeek2Settings,
    dayOfMonthSettings,
    setDayOfWeek,
    setDayOfWeek2,
    setDayOfMonth,
    daysOfWeekArr,
    
  }: {
    enable: boolean;
    frequencySettings: string | null;
    items: DropdownItem[];
    setFrequency: React.Dispatch<React.SetStateAction<string | null>>;
    setItems: React.Dispatch<React.SetStateAction<DropdownItem[]>>;
    handleToggle: () => void;
    dayOfWeekSettings: string | null;
    daysOfWeekArr: string[] | null;
    dayOfWeek2Settings: string | null;
    dayOfMonthSettings: string | null;
    setDayOfWeek: React.Dispatch<React.SetStateAction<string | null>>;
    setDayOfWeek2: React.Dispatch<React.SetStateAction<string | null>>;
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
            frequencySettings={frequencySettings}
            dayOfWeekSettings={dayOfWeekSettings}
            dayOfWeek2Settings={dayOfWeek2Settings}
            dayOfMonthSettings={dayOfMonthSettings}
            setDayOfWeek={setDayOfWeek}
            setDayOfWeek2={setDayOfWeek2}
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
    dayOfWeek2Settings,
    daysOfWeekArr,
    setDayOfWeek2,
    setDaysOfWeekArr,
    dayOfMonthSettings,
    setDayOfMonth,
    setIsActive,
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
          setIsActive(data.isActive);
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
      setIsActive(true);
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
              frequencySettings={frequencySettings}
              items={items}
              setFrequency={setFrequency}
              setItems={setItems}
              handleToggle={handleToggle}
              dayOfWeekSettings={dayOfWeekSettings}
              dayOfWeek2Settings={dayOfWeek2Settings}
              dayOfMonthSettings={dayOfMonthSettings}
              setDayOfWeek={setDayOfWeek}
              setDayOfWeek2={setDayOfWeek2}
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
