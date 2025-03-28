import { NudgeScheduleConfig } from "@/types/nudge";
import { createContext, useState, ReactNode, useContext, SetStateAction, Dispatch } from "react";

interface NudgeSettingsContextType {
  previousFrequency: string | null;
  setPreviousFrequency: Dispatch<SetStateAction<string | null>>;
  frequencySettings: string | null;
  setFrequency: Dispatch<SetStateAction<string | null>>;
  dayOfWeekSettings: string | null;
  setDayOfWeek: Dispatch<SetStateAction<string | null>>;
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
  previousFrequency: null,
  setPreviousFrequency: () => {},
  frequencySettings: null,
  setFrequency: () => {},
  dayOfWeekSettings: null,
  setDayOfWeek: () => {},
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
  const [previousFrequency, setPreviousFrequency] = useState<string | null>(null);
  const [frequencySettings, setFrequency] = useState<string | null>(null);
  const [dayOfWeekSettings, setDayOfWeek] = useState<string | null>(null);
  const [dayOfMonthSettings, setDayOfMonth] = useState<string | null>(null);
  const [daysOfWeekArr, setDaysOfWeekArr] = useState<string[] | null>(null);
  const [nudgeAtSettings, setNudgeAt] = useState<Date | null>(new Date());
  const [isActiveSettings, setIsActive] = useState<boolean>(false);

  return (
    <NudgeSettingsContext.Provider
      value={{
        previousFrequency,
        setPreviousFrequency,
        frequencySettings,
        setFrequency,
        dayOfWeekSettings,
        setDayOfWeek,
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
