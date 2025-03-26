import { Box } from "@/design-system/base/box";
import { MONTHLY_OPTIONS, WEEKLY_OPTIONS } from "../constants/constants";
import NudgeSettings from "./nudge-settings";
import NudgeAtTimePicker from "./nudge-time-settings";

interface NudgeSettingProp {
  frequency: string | null;
  dayOfWeek: string | null;
  setDayOfWeek: React.Dispatch<React.SetStateAction<string | null>>;
  dayOfMonth: string | null;
  setDayOfMonth: React.Dispatch<React.SetStateAction<string | null>>;
}

// TODO: change name
const RenderNudgeSettings: React.FC<NudgeSettingProp> = ({
  frequency,
  dayOfWeek,
  setDayOfWeek,
  dayOfMonth,
  setDayOfMonth,
}) => {
  switch (frequency) {
    case "Disabled":
      return <></>;
    case "Daily":
      return <NudgeAtTimePicker />;
    case "Weekly":
      return (
        <NudgeSettings options={WEEKLY_OPTIONS} curOption={dayOfWeek} setOption={setDayOfWeek} />
      );
    case "Twice a Week": //TODO:
      return (
        <>
          <Box></Box>
        </>
      );
    case "Biweekly":
      return (
        <NudgeSettings options={WEEKLY_OPTIONS} curOption={dayOfWeek} setOption={setDayOfWeek} />
      );
    case "Monthly":
      return (
        <NudgeSettings options={MONTHLY_OPTIONS} curOption={dayOfMonth} setOption={setDayOfMonth} />
      );
    default:
      return <></>;
  }
};

export default RenderNudgeSettings;
