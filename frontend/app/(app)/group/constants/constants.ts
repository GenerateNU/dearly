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

export const WEEKLY_DROPDOWN_OPTIONS = Object.entries(WEEKLY_OPTIONS_MAPPING).map(
  ([value, label]) => ({ value: value, label: label }),
);

export const FREQUENCY_DROPDOWN_OPTIONS = Object.entries(FREQUENCY_LABEL_MAPPING).map(
  ([value, label]) => ({ value: value, label: label }),
);

export enum FREQUENCY {
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
}

export const MONTHLY_DROPDOWN_OPTIONS = Array.from({ length: 28 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

export const convertData = (mapping: {}, key: string) => {
  const data = mapping[key as keyof typeof mapping];
  return data;
};
