import { useNudgeSettings } from "@/contexts/nudge-settings";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useMemo, memo } from "react";

const NudgeAtTimePicker = memo(() => {
  const { nudgeAtSettings, setNudgeAt } = useNudgeSettings();

  const handleChange = useCallback(
    (_: any, date: Date | undefined) => {
      if (!date) return;

      const curDate = new Date();
      const newDate = new Date(
        curDate.getFullYear(),
        curDate.getMonth(),
        curDate.getDay(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
      );
      setNudgeAt(newDate);
    },
    [setNudgeAt],
  );

  const value = useMemo(() => {
    return nudgeAtSettings ?? new Date();
  }, [nudgeAtSettings]);

  return (
    <DateTimePicker
      mode="time"
      onChange={handleChange}
      textColor="black"
      display="spinner"
      value={value}
    />
  );
});

NudgeAtTimePicker.displayName = "NudgeAtTimePicker";

export default NudgeAtTimePicker;
