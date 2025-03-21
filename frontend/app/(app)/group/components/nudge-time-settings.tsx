import { useNudgeSettings } from "@/contexts/nudge-settings";
import DateTimePicker from "@react-native-community/datetimepicker";

const NudgeAtTimePicker = () => {
  const { nudgeAt, setNudgeAt } = useNudgeSettings();
  return (
    <DateTimePicker
      mode="time"
      onChange={(_, date) => {
        console.log(`Time given: ${date}`);
        setNudgeAt(date ?? null);
      }}
      textColor="black"
      display="spinner"
      value={nudgeAt ?? new Date()}
    />
  );
};

export default NudgeAtTimePicker;
