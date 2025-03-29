import { MONTHLY_DROPDOWN_OPTIONS, WEEKLY_DROPDOWN_OPTIONS } from "../constants/constants";
import { NudgeMultipleSelectSettings, NudgeSettings } from "./nudge-settings";
import NudgeAtTimePicker from "./nudge-time-settings";

interface NudgeSettingProp {
  frequency: string | null;
  daysOfWeekArr: string[] | null;
  setDaysOfWeekArr: React.Dispatch<React.SetStateAction<string[] | null>>;
  dayOfMonth: string | null;
  setDayOfMonth: React.Dispatch<React.SetStateAction<string | null>>;
}

const RenderNudgeSettings: React.FC<NudgeSettingProp> = ({
  frequency,
  daysOfWeekArr,
  setDaysOfWeekArr,
  dayOfMonth,
  setDayOfMonth,
}) => {
  switch (frequency) {
    case "DAILY":
      return <NudgeAtTimePicker />;
    case "WEEKLY":
      return (
        <NudgeMultipleSelectSettings
          options={WEEKLY_DROPDOWN_OPTIONS}
          curOption={daysOfWeekArr}
          setOption={setDaysOfWeekArr}
        />
      );
    case "BIWEEKLY":
      return (
        <NudgeMultipleSelectSettings
          options={WEEKLY_DROPDOWN_OPTIONS}
          curOption={daysOfWeekArr}
          setOption={setDaysOfWeekArr}
        />
      );
    case "MONTHLY":
      return (
        <NudgeSettings
          options={MONTHLY_DROPDOWN_OPTIONS}
          curOption={dayOfMonth}
          setOption={setDayOfMonth}
        />
      );
    default:
      return <></>;
  }
};

export default RenderNudgeSettings;
