import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { useCallback, useEffect, useState } from "react";
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
    setDayOfWeek2,
    daysOfWeekArr,
    setDaysOfWeekArr,
    dayOfMonthSettings,
    setDayOfMonth,
    isActiveSettings,
    setIsActive,
    setNudgeAt,
  } = useNudgeSettings();
  const { group } = useUserStore();
  const { data, error, refetch, isLoading, isRefetching } = useGroupNudgeConfig(
    group?.id as string,
  );
  const { mutateAsync: disableNudge, error: disableNudgeError } = useDisableNudge(
    group?.id as string,
  );

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
  }, [data, isDefault, isActiveSettings]);

  useEffect(() => {}, [error, disableNudgeError]);

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

  if (!group) {
    return null;
  }

  const nudgeState = {
    loading: isLoading || isRefetching,
    error: error ? error.message : null,
    data,
  };

  const handleToggle = async () => {
    if (enable) {
      await disableNudge(group?.id as string);
      setEnable(false);
    } else {
      setEnable(true);
    }
  };

  const SuccessComponent = () => (
    <>
      <Text variant="bodyLargeBold">Set Recurring Nudges</Text>
      <Toggle onToggle={handleToggle} enabled={enable} label="Recurring Nudges" />
      {enable && (
        <>
          <Text variant="caption">SELECT FREQUENCY</Text>
          <Dropdown
            id="frequency"
            direction="BOTTOM"
            value={frequencySettings}
            items={items}
            setValue={setFrequency}
            setItems={setItems}
          />
          <Box width="100%" alignItems="center">
            <RenderNudgeSettings
              frequency={frequencySettings}
              dayOfWeek={dayOfWeekSettings}
              setDayOfWeek={setDayOfWeek}
              dayOfMonth={dayOfMonthSettings}
              setDayOfMonth={setDayOfMonth}
              daysOfWeekArr={daysOfWeekArr}
              setDaysOfWeekArr={setDaysOfWeekArr}
            />
            {/* {renderSettings()} */}
            <SaveNudgeScheduleButton />
          </Box>
        </>
      )}
    </>
  );

  const LoadingComponent = () => {
    return (
      <Box width="100%" flex={1} alignItems="center">
        <Spinner />
      </Box>
    );
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
          successComponent={<SuccessComponent />}
          loadingComponent={<LoadingComponent />}
          errorComponent={<ErrorDisplay refresh={refetch} />}
        />
      </Box>
    </SafeAreaView>
  );
};

export default SetRecurringNudge;
