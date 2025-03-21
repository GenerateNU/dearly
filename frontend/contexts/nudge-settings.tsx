import { createContext, useState, ReactNode, useContext, SetStateAction, Dispatch } from "react";

export interface NudgeSettings {
  group: string;
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
  daysOfWeek: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[] | null;
  dayOfMonth: number | null;
  nudgeAt: string;
  isActive: boolean;
}

interface NudgeSettingsContextType {
  frequency: string | null;
  setFrequency: Dispatch<SetStateAction<string | null>>;
  dayOfWeek: string | null;
  setDayOfWeek: Dispatch<SetStateAction<string | null>>;
  dayOfMonth: number | null;
  setDayOfMonth: Dispatch<SetStateAction<number | null>>;
  nudgeAt: Date | null;
  setNudgeAt: Dispatch<SetStateAction<Date | null>>;
}

export const NudgeSettingsContext = createContext<NudgeSettingsContextType>({
  frequency: null,
  setFrequency: () => {},
  dayOfWeek: null,
  setDayOfWeek: () => {},
  dayOfMonth: null,
  setDayOfMonth: () => {},
  nudgeAt: null,
  setNudgeAt: () => {},
});

interface NudgeSettingsProviderProps {
  children: ReactNode;
}

export const NudgeSettingsProvider: React.FC<NudgeSettingsProviderProps> = ({ children }) => {
  const [nudgeSettings, setRecurringNudge] = useState<NudgeSettings | null>(null);
  const [frequency, setFrequency] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<string | null>(null);
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null);
  const [nudgeAt, setNudgeAt] = useState<Date | null>(null);

  return (
    <NudgeSettingsContext.Provider
      value={{
        frequency,
        setFrequency,
        dayOfWeek,
        setDayOfWeek,
        dayOfMonth,
        setDayOfMonth,
        nudgeAt,
        setNudgeAt,
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
