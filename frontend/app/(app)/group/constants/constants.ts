export const WEEKLY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const WEEKLY_OPTIONS_MAPPING = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

export const FREQUENCY_LABEL_MAPPING = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  MONTHLY: "Monthly",
};

export enum FREQUENCY {
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
}
export const FREQUENCY_OPTIONS = ["Daily", "Twice a Week", "Weekly", "Biweekly", "Monthly"];
export const MONTHLY_OPTIONS = Array.from({ length: 28 }, (_, i) => String(i + 1));

export const convertData = (mapping: {}, key: string) => {
  const data = mapping[key as keyof typeof mapping];
  return data;
};
