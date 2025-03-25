import { useNudgeSettings } from "@/contexts/nudge-settings";
import DateTimePicker from "@react-native-community/datetimepicker";

const NudgeAtTimePicker = () => {
  const { nudgeAtSettings, setNudgeAt } = useNudgeSettings();

  return (
    <DateTimePicker
      mode="time"
      onChange={(_, date) => {
        const curDate = new Date();
        setNudgeAt(
          new Date(
            curDate.getFullYear(),
            curDate.getMonth(),
            curDate.getDay(),
            date?.getHours(),
            date?.getMinutes(),
            date?.getSeconds(),
          ),
        );
      }}
      textColor="black"
      display="spinner"
      value={nudgeAtSettings ?? new Date()}
    />
  );
};

export default NudgeAtTimePicker;
