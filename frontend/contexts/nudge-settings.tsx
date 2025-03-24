import { createContext, useState, ReactNode, useContext, SetStateAction, Dispatch } from "react";
import { boolean } from "zod";

export interface NudgeSettings {
  group: string;
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
  daysOfWeek: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[] | null;
  dayOfMonth: number | null;
  nudgeAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NudgeSettingsContextType {
  nudgeSettings: NudgeSettings | null;
  setRecurringNudge: Dispatch<SetStateAction<NudgeSettings | null>>;
  frequency: string | null;
  setFrequency: Dispatch<SetStateAction<string | null>>;
  dayOfWeek: string | null;
  setDayOfWeek: Dispatch<SetStateAction<string | null>>;
  dayOfMonth: number | null;
  setDayOfMonth: Dispatch<SetStateAction<number | null>>;
  nudgeAt: Date | null;
  setNudgeAt: Dispatch<SetStateAction<Date | null>>;
  isValidated: boolean;
  setIsValidated: Dispatch<SetStateAction<boolean>>;
  validationMessage: string | null;
  setValidationMessage: Dispatch<SetStateAction<string | null>>;
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
  isValidated: false,
  setIsValidated: () => {},
  validationMessage: null,
  setValidationMessage: () => {},
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
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

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
        isValidated,
        setIsValidated,
        validationMessage,
        setValidationMessage,
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
