import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { useCallback, useEffect, useState } from "react";
import { Text } from "@/design-system/base/text";
import { useNudgeSettings } from "@/contexts/nudge-settings";
import NudgeSettings from "./components/nudge-settings";
import NudgeAtTimePicker from "./components/nudge-time-settings";
import { useUserStore } from "@/auth/store";
import { useDisableNudge, useGroupNudgeConfig } from "@/hooks/api/nudge";
import { isNoNudgeConfig, isNudgeScheduleConfig, NudgeScheduleConfig } from "@/types/nudge";
import SaveNudgeScheduleButton from "./components/save-nudge";
import {
  FREQUENCY_LABEL_MAPPING,
  FREQUENCY_OPTIONS,
  MONTHLY_OPTIONS,
  WEEKLY_OPTIONS,
  WEEKLY_OPTIONS_MAPPING,
} from "./constants/constants";
import Toggle from "@/design-system/components/shared/toggle";
import { useFocusEffect } from "expo-router";
import ResourceView from "@/design-system/components/utilities/resource-view";
import Spinner from "@/design-system/components/shared/spinner";
import ErrorDisplay from "@/design-system/components/shared/states/error";

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

  const [isDefault, setIsDefault] = useState(false);
  const [enable, setEnable] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        if (isNoNudgeConfig(data)) {
          setEnable(false);
        } else if (isNudgeScheduleConfig(data)) {
          if (data.isActive) {
            setEnable(true);
          } else {
            setEnable(false);
          }
          console.log(`Data: ${JSON.stringify(data)}`);
          setFrequency(
            FREQUENCY_LABEL_MAPPING[data.frequency as keyof typeof FREQUENCY_LABEL_MAPPING],
          );
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
      refetch();
      setIsDefault(true);
    }, [refetch]),
  );

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

  if (!group) {
    return null;
  }

  const renderSettings = () => {
    switch (frequencySettings) {
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
      case "Twice a Week":
        return (
          <>
            <Box>
              <Text>First Nudge</Text>
              <Text>Second Nudge</Text>
              <NudgeSettings
                options={WEEKLY_OPTIONS}
                curOption={dayOfWeek2Settings}
                setOption={setDayOfWeek2}
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
            {renderSettings()}
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
