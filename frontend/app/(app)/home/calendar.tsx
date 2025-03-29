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
  ListRenderItem,
  ActivityIndicator,
  View,
} from "react-native";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import { getMonthScrollRange, isSameDate, isValidDateData } from "@/utilities/time";
import { CalendarDay } from "@/types/group";

type ViewMode = "month" | "week" | "year";

interface DayComponentProps {
  date: DateData;
  state?: string;
  onPress?: (date: DateData) => void;
  selected?: boolean;
  image?: string;
}

const CustomDayComponent = memo(({ date, state, onPress, selected, image }: DayComponentProps) => {
  if (!date || typeof date !== "object" || !date.dateString) {
    return null;
  }

  if (image) {
    return (
      <TouchableOpacity
        onPress={() => onPress && onPress(date)}
        activeOpacity={0.7}
        style={styles.dayComponentWrapper}
      >
        <ImageBackground
          source={{ uri: image }}
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
  }

  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(date)}
      activeOpacity={0.7}
      style={styles.dayComponentWrapper}
    >
      <View
        style={[
          styles.dayContainer,
          state === "today" && styles.todayContainer,
          selected && styles.selectedContainer,
        ]}
      >
        <Text color="ink" variant="caption" style={selected && styles.selectedDayText}>
          {date.day}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const Calendar: React.FC = () => {
  const { group } = useUserStore();
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string | undefined>(todayString);
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [currentPivot, setCurrentPivot] = useState<Date>(today);

  const {
    data: calendarData,
    isLoading,
    error,
    fetchPreviousMonths,
    fetchFutureMonths,
    isFetchingPrevious,
    isFetchingFuture,
  } = useGroupCalendar(group?.id || "", currentPivot, 3);
  console.log(JSON.stringify(calendarData));

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

  const daysWithContent = useMemo(() => {
    const contentMap = new Map();

    if (calendarData) {
      calendarData.forEach((month) => {
        const year = month.year;
        const monthNum = month.month;

        month.data.forEach((dayData: CalendarDay) => {
          const day = dayData.day;
          const dateKey = `${year}-${String(monthNum).padStart(2, "0")}-${String(Math.floor(day)).padStart(2, "0")}`;

          console.log(dayData);
          contentMap.set(dateKey, dayData.url);
        });
      });
    }

    return contentMap;
  }, [calendarData]);

  // Years list for the year selection view
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

  // Handler for calendar scrolling to load more data
  const handleCalendarScroll = useCallback(
    (data: any) => {
      // Check if we're approaching the edges of loaded data
      const visibleMonthYear = data.visibleMonths?.[0];
      if (visibleMonthYear) {
        const year = visibleMonthYear.year;
        const month = visibleMonthYear.month;

        // Create a new pivot date for fetching
        const newPivotDate = new Date(year, month - 1, 1);

        // Check if we're scrolling up (newer months) or down (older months)
        if (data.direction === "up") {
          // Load future months if scrolling up
          setCurrentPivot(newPivotDate);
          fetchFutureMonths();
        } else if (data.direction === "down") {
          // Load previous months if scrolling down
          setCurrentPivot(newPivotDate);
          fetchPreviousMonths();
        }
      }
    },
    [fetchFutureMonths, fetchPreviousMonths],
  );

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

  const getFutureScrollRange = useCallback(() => getMonthScrollRange(selectedYear), [selectedYear]);

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

  // Updated to include hasContent prop from daysWithContent map
  const renderDayComponentForCalendarList = useCallback(
    (props: any) => {
      if (!isValidDateData(props.date)) return null;

      const normalizedSelected = isSameDate(props.date, selectedDate);
      const dateKey = props.date.dateString;
      const dayContent = daysWithContent.get(dateKey);

      return (
        <CustomDayComponent
          date={props.date}
          state={props.state}
          selected={normalizedSelected}
          onPress={handleDayPress}
          image={dayContent}
        />
      );
    },
    [selectedDate, handleDayPress, daysWithContent],
  );

  // Updated to include hasContent prop
  const renderDayComponentForWeekCalendar = useCallback(
    (props: any) => {
      if (!isValidDateData(props.date)) return null;

      const normalizedSelected = isSameDate(props.date, selectedDate);
      const dateKey = props.date.dateString;
      const dayContent = daysWithContent.get(dateKey);

      return (
        <CustomDayComponent
          date={props.date}
          state={props.state}
          selected={normalizedSelected}
          image={dayContent}
          onPress={(date) => {
            setSelectedDate(date.dateString);
          }}
        />
      );
    },
    [selectedDate, daysWithContent],
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
            futureScrollRange={50}
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
      {isLoading && calendarData?.length === 0 ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#FFC107" />
        </Box>
      ) : (
        <>
          {isFetchingFuture && (
            <Box padding="s" alignItems="center">
              <ActivityIndicator size="small" color="#FFC107" />
            </Box>
          )}

          <CalendarList
            pastScrollRange={50}
            futureScrollRange={getFutureScrollRange()}
            maxDate={getMaxDate()}
            scrollEnabled={true}
            showScrollIndicator={false}
            bounces={false}
            firstDay={1}
            onVisibleMonthsChange={handleCalendarScroll}
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

          {isFetchingPrevious && (
            <Box padding="s" alignItems="center">
              <ActivityIndicator size="small" color="#FFC107" />
            </Box>
          )}
        </>
      )}
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
  emptyDayContainer: {
    opacity: 0.5,
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
