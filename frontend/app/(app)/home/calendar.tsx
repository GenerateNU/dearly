const isValidDateData = (date: any): date is DateData => {
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
import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { useGroupCalendar } from "@/hooks/api/group";
import { CalendarList, CalendarProvider, WeekCalendar, DateData } from "react-native-calendars";
import { Text } from "@/design-system/base/text";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  ListRenderItem,
} from "react-native";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { BackIcon } from "@/design-system/components/shared/icons/back-icon";

type ViewMode = "month" | "week" | "year";

interface DayComponentProps {
  date: DateData;
  state?: string;
  onPress?: (date: DateData) => void;
  selected?: boolean;
}

interface WeekData {
  firstDay: string;
  lastDay: string;
}

// Memoize the CustomDayComponent to prevent unnecessary re-renders
const CustomDayComponent = memo(({ date, state, onPress, selected }: DayComponentProps) => {
  // Make sure date is a valid DateData object
  if (!date || typeof date !== "object" || !date.dateString) {
    return null; // Return null if date is invalid
  }
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(date)}
      activeOpacity={0.7}
      style={styles.dayComponentWrapper}
    >
      <ImageBackground
        source={{
          uri: "https://assets.wwf.org.au/image/upload/c_fill,g_auto,w_1400/f_auto/q_auto/v1/website-media/news-blogs/quokka?q=75",
        }}
        style={[
          styles.dayContainer,
          state === "today" && styles.todayContainer,
          selected && styles.selectedContainer,
        ]}
        imageStyle={styles.imageBackground}
      >
        <Text color="ink" variant="caption" style={selected && styles.selectedDayText}>
          {date.day}
        </Text>
      </ImageBackground>
    </TouchableOpacity>
  );
});

// Separate the YearItem component to improve FlatList performance
const YearItem = memo(
  ({
    item,
    selectedYear,
    onSelectYear,
  }: {
    item: number;
    selectedYear: number;
    onSelectYear: (year: number) => void;
  }) => (
    <TouchableOpacity onPress={() => onSelectYear(item)} style={styles.yearItemContainer}>
      <Text
        variant="bodyBold"
        style={[styles.yearText, item === selectedYear && styles.selectedYearText]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  ),
);

interface DayProps {
  date?: DateData;
  state?: string;
  marking?: any;
  markingType?: string;
  onPress?: (date: DateData) => void;
  onLongPress?: (date: DateData) => void;
}

const isSameDate = (date1: DateData | string | undefined, date2: string | undefined): boolean => {
  if (!date1 || !date2) return false;

  const d1 = typeof date1 === "string" ? date1 : date1.dateString;
  const d2 = typeof date2 === "string" ? date2 : date2;

  return d1 === d2;
};

const Calendar: React.FC = () => {
  const { group } = useUserStore();
  const { data, isLoading } = useGroupCalendar(group?.id || "", new Date(), 3);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string | undefined>(todayString);
  const [formattedDate, setFormattedDate] = useState<string>("");

  const years = useMemo(
    () => [
      new Date().getFullYear(),
      ...Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - (i + 1)),
    ],
    [],
  );

  const [yearsList, setYearsList] = useState<number[]>(years);
  const yearListRef = useRef<FlatList<number>>(null);

  useEffect(() => {
    if (selectedDate) {
      const [year, month, day] = selectedDate.split("-").map(Number);

      if (year && month && day) {
        const date = new Date(year, month - 1, day);

        const formatted = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        setFormattedDate(formatted);
      }
    }
  }, [selectedDate]);

  const loadMoreYears = useCallback((): void => {
    const currentYear = yearsList[0];

    if (currentYear && currentYear > 2000) {
      const newYears = Array.from(
        { length: 5 },
        (_, i) => currentYear - (yearsList.length + i + 1),
      );
      setYearsList((prevYears) => [...prevYears, ...newYears]);
    }
  }, [yearsList]);

  const getFutureScrollRange = useCallback((): number => {
    const currentYear = new Date().getFullYear();

    if (selectedYear === currentYear) {
      return 0; // No future scrolling beyond current month
    }

    if (selectedYear < currentYear) {
      return 11;
    }

    return 0;
  }, [selectedYear]);

  const getMaxDate = useCallback((): string | undefined => {
    return todayString;
  }, [todayString]);

  const handleSelectYear = useCallback((year: number) => {
    setSelectedYear(year);
    setViewMode("month");
  }, []);

  const renderCustomHeader = useCallback((date: any): React.ReactNode => {
    const month = date.toString("MMMM");
    const year = date.toString("yyyy");

    return (
      <TouchableOpacity onPress={() => setViewMode("year")} style={{ width: "100%" }}>
        <Box width="100%" gap="xs" flexDirection="row" alignItems="center" paddingTop="m">
          <Icon name="calendar-blank-outline" />
          <Text variant="bodyBold">{month}</Text>
          <Text variant="bodyBold">{year}</Text>
        </Box>
      </TouchableOpacity>
    );
  }, []);

  const renderYearItem: ListRenderItem<number> = useCallback(
    ({ item }) => (
      <YearItem item={item} selectedYear={selectedYear} onSelectYear={handleSelectYear} />
    ),
    [selectedYear, handleSelectYear],
  );

  const handleDayPress = useCallback((day: DateData): void => {
    setSelectedDate(day.dateString);
    setViewMode("week");
  }, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 44,
      offset: 44 * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: number) => item.toString(), []);

  const renderDayComponentForCalendarList = useCallback(
    (props: any) => {
      if (!isValidDateData(props.date)) return null;

      const normalizedSelected = isSameDate(props.date, selectedDate);
      return (
        <CustomDayComponent
          date={props.date}
          state={props.state}
          selected={normalizedSelected}
          onPress={handleDayPress}
        />
      );
    },
    [selectedDate, handleDayPress],
  );

  const renderDayComponentForWeekCalendar = useCallback(
    (props: any) => {
      if (!isValidDateData(props.date)) return null;

      const normalizedSelected = isSameDate(props.date, selectedDate);
      return (
        <CustomDayComponent
          date={props.date}
          state={props.state}
          selected={normalizedSelected}
          onPress={(date) => {
            setSelectedDate(date.dateString);
          }}
        />
      );
    },
    [selectedDate],
  );

  const currentDate = useMemo(
    () =>
      selectedYear < new Date().getFullYear()
        ? `${selectedYear}-01-01`
        : new Date().toISOString().split("T")[0],
    [selectedYear],
  );

  const initialScrollIndex = useMemo(() => {
    return yearsList.findIndex((year) => year === selectedYear);
  }, [yearsList, selectedYear]);

  if (viewMode === "year") {
    return (
      <Box flex={1} paddingHorizontal="m">
        <FlatList
          ref={yearListRef}
          data={yearsList}
          renderItem={renderYearItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.yearList}
          initialScrollIndex={initialScrollIndex >= 0 ? initialScrollIndex : 0}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={getItemLayout}
          onEndReached={loadMoreYears}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
        />
      </Box>
    );
  }

  if (viewMode === "week") {
    return (
      <CalendarProvider
        date={selectedDate as string}
        onDateChanged={(date) => {
          setSelectedDate(date);
        }}
        onMonthChange={(month) => {
          console.log("Month changed", month);
        }}
      >
        <Box paddingHorizontal="m">
          <BackIcon text={formattedDate} onPress={() => setViewMode("month")} />
        </Box>
        <Box style={styles.weekCalendarContainer}>
          <WeekCalendar
            firstDay={1}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              selectedDayBackgroundColor: "#FFC107",
            }}
            pastScrollRange={50}
            futureScrollRange={0}
            maxDate={todayString}
            calendarHeight={120}
            allowShadow={false}
            bounces={false}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            dayComponent={renderDayComponentForWeekCalendar}
          />
        </Box>
      </CalendarProvider>
    );
  }

  return (
    <Box paddingBottom="xl" marginBottom="xl">
      <CalendarList
        pastScrollRange={50}
        futureScrollRange={getFutureScrollRange()}
        maxDate={getMaxDate()}
        scrollEnabled={true}
        showScrollIndicator={true}
        bounces={false}
        firstDay={1}
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
        }}
        renderHeader={renderCustomHeader}
        dayComponent={renderDayComponentForCalendarList}
        current={currentDate}
        hideExtraDays={true}
        onDayPress={handleDayPress}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  dayComponentWrapper: {
    width: 40,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  dayContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 45,
    borderRadius: 8,
    overflow: "hidden",
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: "#FFC107",
    backgroundColor: "rgba(255, 193, 7, 0.3)",
  },
  selectedDayText: {
    fontWeight: "bold",
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  yearList: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  yearItemContainer: {
    paddingVertical: 8,
    marginVertical: 2,
    alignItems: "flex-start",
    height: 44,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "600",
  },
  selectedYearText: {
    color: "#FFC107",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  weekCalendarContainer: {
    height: 120,
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 10,
  },
});

export default Calendar;
