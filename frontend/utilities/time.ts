import { ZodiacDatesAndIcons } from "@/constants/zodiac";
import { MaterialIcon } from "@/types/icon";
import { DateData } from "react-native-calendars";

export const isValidDateData = (date: any): date is DateData => {
  return (
    date !== undefined &&
    date !== null &&
    typeof date === "object" &&
    "dateString" in date &&
    typeof date.dateString === "string" &&
    "day" in date &&
    typeof date.day === "number"
  );
};

export const isSameDate = (
  date1: DateData | string | undefined,
  date2: string | undefined,
): boolean => {
  if (!date1 || !date2) return false;

  const d1 = typeof date1 === "string" ? date1 : date1.dateString;
  const d2 = typeof date2 === "string" ? date2 : date2;

  return d1 === d2;
};

export const getMonthScrollRange = (selectedYear: number) => {
  const currentYear = new Date().getFullYear();

  if (selectedYear === currentYear) {
    return 0;
  }

  if (selectedYear < currentYear) {
    return 11;
  }

  return 0;
};

export const timeAgo = (date: Date = new Date()): string => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval === 1 ? "1 min ago" : `${interval} minutes ago`;
  return seconds === 1 ? "Just now" : `${seconds}s ago`;
};

export const categorizeTime = (time: string) => {
  const now = new Date();
  const notificationDate = new Date(time);
  const diffInMs = now.getTime() - notificationDate.getTime();
  const diffInDays = diffInMs / (1000 * 3600 * 24);

  if (diffInDays < 1) return "New";
  if (diffInDays < 7) return `${Math.floor(diffInDays)}D`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}W`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}M`;
  return `${Math.floor(diffInDays / 365)}Y`;
};

export const formatTime = (createdAt: string): string => {
  const now = new Date();
  const time = new Date(createdAt);
  const seconds = Math.floor((now.getTime() - time.getTime()) / 1000); // Time difference in seconds

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (seconds < minute) {
    return "Just now";
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  } else if (seconds < week) {
    const days = Math.floor(seconds / day);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else {
    return formatDay(time);
  }
};

export const formatDay = (time: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return time.toLocaleDateString("en-US", options);
};

export const getZodiacIcon = (date: string): MaterialIcon => {
  const birthday = new Date(date);
  const month = birthday.getMonth() + 1;
  const day = birthday.getDate();

  for (const { icon, start, end } of ZodiacDatesAndIcons) {
    const startDate = new Date(2020, start.month - 1, start.day);
    const endDate = new Date(2020, end.month - 1, end.day);
    const birthDate = new Date(2020, month - 1, day);

    if (startDate <= endDate) {
      if (birthDate >= startDate && birthDate <= endDate) {
        return icon;
      }
    } else {
      if (birthDate >= startDate || birthDate <= endDate) {
        return icon;
      }
    }
  }

  throw new Error("Invalid birthday");
};

export const formatSeconds = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return minutes.toString() + ":" + seconds.toString().padStart(2, "0");
};
