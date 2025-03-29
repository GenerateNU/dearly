import React, { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/auth/store";
import { Box } from "@/design-system/base/box";
import { useGroupCalendar } from "@/hooks/api/group";
import { CalendarList, CalendarProvider, WeekCalendar } from "react-native-calendars";
import { Text } from "@/design-system/base/text";
import { ImageBackground, StyleSheet, TouchableOpacity, FlatList, View } from "react-native";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { BackIcon } from "@/design-system/components/shared/icons/back-icon";

// Custom day component to be used in both calendar views
const CustomDayComponent = ({ date, state, onPress, selected }) => {
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
};

// Helper function to ensure consistent date formatting
const formatDateString = (dateString) => {
  // Ensure we're working with UTC to prevent timezone issues
  const date = new Date(dateString + "T00:00:00Z");
  return date.toISOString().split("T")[0];
};

const Calendar = () => {
  const { group } = useUserStore();
  const { data, isLoading } = useGroupCalendar(group?.id || "", new Date(), 3);
  const [viewMode, setViewMode] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Initialize with today's date in consistent format
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [formattedDate, setFormattedDate] = useState("");
  const [years, setYears] = useState([
    new Date().getFullYear(),
    ...Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - (i + 1)),
  ]);
  const yearListRef = useRef(null);

  // Format date whenever selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      // Use a consistent way to create Date object to avoid timezone issues
      const date = new Date(selectedDate + "T00:00:00Z");
      const formatted = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      setFormattedDate(formatted);
    }
  }, [selectedDate]);

  const loadMoreYears = () => {
    const currentYear = years[0];

    if (currentYear > 2000) {
      const newYears = Array.from({ length: 5 }, (_, i) => currentYear - (years.length + i + 1));
      setYears((prevYears) => [...prevYears, ...newYears]);
    }
  };

  const getFutureScrollRange = () => {
    const currentYear = new Date().getFullYear(); // 2025

    // If viewing the current year, don't allow scrolling beyond current month
    if (selectedYear === currentYear) {
      return 0; // No future scrolling beyond current month
    }

    // If viewing a past year, allow all 12 months
    if (selectedYear < currentYear) {
      return 11; // Allow scrolling through all months (0-11)
    }

    // If somehow in a future year
    return 0; // No future scrolling
  };

  const renderCustomHeader = (date) => {
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
  };

  const renderYearItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedYear(item);
        setViewMode("month");
      }}
      style={styles.yearItemContainer}
    >
      <Text
        variant="bodyBold"
        style={[styles.yearText, item === selectedYear && styles.selectedYearText]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const handleDayPress = (day) => {
    // Ensure consistent date format
    const formattedDateString = formatDateString(day.dateString);
    setSelectedDate(formattedDateString);
    setViewMode("week");
  };

  const handleWeekChange = (week) => {
    // Update the selected date when scrolling through weeks
    if (week && week.firstDay) {
      const formattedDateString = formatDateString(week.firstDay);
      setSelectedDate(formattedDateString);
    }
  };

  if (viewMode === "year") {
    return (
      <Box flex={1} paddingHorizontal="m">
        <FlatList
          ref={yearListRef}
          data={years}
          renderItem={renderYearItem}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.yearList}
          initialScrollIndex={years.findIndex((year) => year === selectedYear)}
          maxToRenderPerBatch={15}
          windowSize={10}
          removeClippedSubviews={true}
          getItemLayout={(_, index) => ({
            length: 44,
            offset: 44 * index,
            index,
          })}
          onEndReached={loadMoreYears}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    );
  }

  if (viewMode === "week") {
    return (
      <CalendarProvider
        date={selectedDate}
        onDateChanged={(date) => {
          const formattedDateString = formatDateString(date);
          setSelectedDate(formattedDateString);
        }}
        onMonthChange={(month) => {
          console.log("Month changed", month);
        }}
      >
        <Box flex={1} paddingHorizontal="m">
          <BackIcon text={formattedDate} onPress={() => setViewMode("month")} />
          <Box marginTop="s">
            <WeekCalendar
              firstDay={1}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#b6c1cd",
                selectedDayBackgroundColor: "#FFC107",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#FFC107",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                dotColor: "#FFC107",
                selectedDotColor: "#ffffff",
                arrowColor: "#FFC107",
                monthTextColor: "#2d4150",
                indicatorColor: "#FFC107",
                textDayFontWeight: "300",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "300",
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 16,
              }}
              allowShadow={false}
              style={styles.weekCalendar}
              onDayPress={(day) => {
                const formattedDateString = formatDateString(day.dateString);
                setSelectedDate(formattedDateString);
              }}
              onWeekChange={handleWeekChange}
              dayComponent={({ date, state }) => {
                const normalizedSelected = formatDateString(date.dateString) === selectedDate;
                return (
                  <CustomDayComponent
                    date={date}
                    state={state}
                    selected={normalizedSelected}
                    onPress={(date) => {
                      const formattedDateString = formatDateString(date.dateString);
                      setSelectedDate(formattedDateString);
                    }}
                  />
                );
              }}
            />
          </Box>
        </Box>
      </CalendarProvider>
    );
  }

  const currentDate =
    selectedYear < new Date().getFullYear()
      ? `${selectedYear}-01-01` // For past years, start at January
      : new Date().toISOString().split("T")[0]; // For current year, start at current date

  return (
    <Box paddingBottom="xl">
      <CalendarList
        pastScrollRange={50}
        futureScrollRange={getFutureScrollRange()}
        scrollEnabled={true}
        showScrollIndicator={true}
        firstDay={1}
        renderHeader={renderCustomHeader}
        dayComponent={({ date, state }) => {
          const normalizedSelected = formatDateString(date.dateString) === selectedDate;
          return (
            <CustomDayComponent
              date={date}
              state={state}
              selected={normalizedSelected}
              onPress={(date) => handleDayPress(date)}
            />
          );
        }}
        style={{
          marginBottom: 120,
        }}
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
    height: 45,
    justifyContent: "center",
    alignItems: "center",
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
  backButtonText: {
    marginLeft: 8,
  },
  weekCalendar: {
    height: 100,
    width: "100%",
  },
});

export default Calendar;
