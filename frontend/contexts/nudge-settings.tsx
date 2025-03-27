import { NudgeScheduleConfig } from "@/types/nudge";
import { createContext, useState, ReactNode, useContext, SetStateAction, Dispatch } from "react";

interface NudgeSettingsContextType {
  nudgeSettings: NudgeScheduleConfig | null;
  setRecurringNudge: Dispatch<SetStateAction<NudgeScheduleConfig | null>>;
  frequencySettings: string | null;
  setFrequency: Dispatch<SetStateAction<string | null>>;
  dayOfWeekSettings: string | null;
  setDayOfWeek: Dispatch<SetStateAction<string | null>>;
  dayOfWeek2Settings: string | null;
  setDayOfWeek2: Dispatch<SetStateAction<string | null>>;
  daysOfWeekArr: string[] | null;
  setDaysOfWeekArr: Dispatch<SetStateAction<string[] | null>>;
  dayOfMonthSettings: string | null;
  setDayOfMonth: Dispatch<SetStateAction<string | null>>;
  nudgeAtSettings: Date | null;
  setNudgeAt: Dispatch<SetStateAction<Date | null>>;
  isActiveSettings: boolean;
  setIsActive: Dispatch<SetStateAction<boolean>>;
}

export const NudgeSettingsContext = createContext<NudgeSettingsContextType>({
  nudgeSettings: null,
  setRecurringNudge: () => {},
  frequencySettings: null,
  setFrequency: () => {},
  dayOfWeekSettings: null,
  setDayOfWeek: () => {},
  dayOfWeek2Settings: null,
  setDayOfWeek2: () => {},
  daysOfWeekArr: null,
  setDaysOfWeekArr: () => {},
  dayOfMonthSettings: null,
  setDayOfMonth: () => {},
  nudgeAtSettings: null,
  setNudgeAt: () => {},
  isActiveSettings: false,
  setIsActive: () => {},
});

interface NudgeSettingsProviderProps {
  children: ReactNode;
}

export const NudgeSettingsProvider: React.FC<NudgeSettingsProviderProps> = ({ children }) => {
  const [nudgeSettings, setRecurringNudge] = useState<NudgeScheduleConfig | null>(null);
  const [frequencySettings, setFrequency] = useState<string | null>(null);
  const [dayOfWeekSettings, setDayOfWeek] = useState<string | null>(null);
  const [dayOfWeek2Settings, setDayOfWeek2] = useState<string | null>(null);
  const [dayOfMonthSettings, setDayOfMonth] = useState<string | null>(null);
  const [daysOfWeekArr, setDaysOfWeekArr] = useState<string[] | null>(null);
  const [nudgeAtSettings, setNudgeAt] = useState<Date | null>(new Date());
  const [isActiveSettings, setIsActive] = useState<boolean>(false);

  return (
    <NudgeSettingsContext.Provider
      value={{
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
        nudgeAtSettings,
        setNudgeAt,
        isActiveSettings,
        setIsActive,
      }}
    >
      {children}
    </NudgeSettingsContext.Provider>
  );
};

export const useNudgeSettings = () => {
  const context = useContext(NudgeSettingsContext);

  if (!context) {
    throw new Error("useNudgeSettings must be used within a NudgeSettingProvider");
  }

  return context;
};
