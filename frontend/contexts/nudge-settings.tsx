import React, { createContext, useState, ReactNode, useContext } from "react";

export interface NudgeSettings {
  group: string;
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
  daysOfWeek: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[] | null;
  dayOfMonth: number | null;
  nudgeAt: string;
  isActive: boolean;
}

interface NudgeSettingsContextType {
  nudgeSettings: NudgeSettings | null;
  setRecurringNudge: (updatedNudgeSetting: NudgeSettings | null) => void;
  frequency: string | null;
  setFrequency: (frequency: string | null) => void;
  dayOfWeek: string | null;
  setDayOfWeek: (dayOfWeek: string | null) => void;
  dayOfMonth: number | null;
  setDayOfMonth: (dayOfMonth: number | null) => void;
  nudgeAt: Date | null;
  setNudgeAt: (updatedNudgeTime: Date | null) => void;
}

export const NudgeSettingsContext = createContext<NudgeSettingsContextType>({
  nudgeSettings: null,
  setRecurringNudge: () => {},
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
        nudgeSettings,
        setRecurringNudge,
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
