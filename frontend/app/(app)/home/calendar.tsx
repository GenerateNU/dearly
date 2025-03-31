import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { useGroupCalendar } from "@/hooks/api/group";
import { CalendarList, CalendarProvider, WeekCalendar, DateData } from "react-native-calendars";
import { Text } from "@/design-system/base/text";
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Pressable,
  Keyboard,
} from "react-native";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { BackIcon } from "@/design-system/components/shared/icons/back-icon";
import { getMonthScrollRange, isSameDate, isValidDateData } from "@/utilities/time";
import { CalendarDay } from "@/types/group";
import Feed, { CommentLikesPopup } from "./feed";
import { CustomDayComponent } from "./calendar-day";
import Spinner from "@/design-system/components/shared/spinner";
import BottomSheet from "@gorhom/bottom-sheet";

type ViewMode = "month" | "week" | "year";

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
        <Text variant="bodyBold" color={selectedYear === item ? "honey" : "ink"}>
          {item}
        </Text>
      </TouchableOpacity>
    ),
  );

  YearItem.displayName = "YearItem";

  const commentRef = useRef<BottomSheet>(null);
  const likeRef = useRef<BottomSheet>(null);

  const daysWithContent = useMemo(() => {
    const contentMap = new Map();

    if (calendarData) {
      calendarData.forEach((month) => {
        const year = month.year;
        const monthNum = month.month;

        month.data.forEach((dayData: CalendarDay) => {
          const day = dayData.day;
          const dateKey = `${year}-${String(monthNum).padStart(2, "0")}-${String(Math.floor(day)).padStart(2, "0")}`;
          contentMap.set(dateKey, dayData.url);
        });
      });
    }

    return contentMap;
  }, [calendarData]);

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

  const handleCalendarScroll = useCallback(
    (data: any) => {
      const visibleMonthYear = data.visibleMonths?.[0];
      if (visibleMonthYear) {
        const year = visibleMonthYear.year;
        const month = visibleMonthYear.month;

        const newPivotDate = new Date(year, month - 1, 1);

        if (data.direction === "up") {
          setCurrentPivot(newPivotDate);
          fetchFutureMonths();
        } else if (data.direction === "down") {
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
      <Box>
        <CalendarProvider
          date={selectedDate as string}
          onDateChanged={(date) => {
            setSelectedDate(date);
          }}
        >
          <Box paddingHorizontal="m">
            <BackIcon text={formattedDate} onPress={() => setViewMode("month")} />
          </Box>
          <Box marginVertical="xxs">
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
              calendarHeight={60}
              allowShadow={false}
              bounces={false}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
              dayComponent={renderDayComponentForWeekCalendar}
            />
          </Box>
          <Box style={{ paddingBottom: 100 }}>
            <Feed date={selectedDate} popup={false} commentRef={commentRef} likeRef={likeRef} />
          </Box>
          <CommentLikesPopup commentRef={commentRef} likeRef={likeRef} />
        </CalendarProvider>
      </Box>
    );
  }

  const LoadingComponent = () => (
    <Box padding="s" alignItems="center">
      <Spinner />
    </Box>
  );

  return (
    <Box paddingBottom="xl" marginBottom="xl">
      {isLoading && calendarData?.length === 0 ? (
        <LoadingComponent />
      ) : (
        <>
          {isFetchingFuture && <LoadingComponent />}
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
            style={{
              marginBottom: 100,
            }}
          />
          {isFetchingPrevious && <LoadingComponent />}
        </>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
});

export default Calendar;
