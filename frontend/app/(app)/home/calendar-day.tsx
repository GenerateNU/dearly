import { memo } from "react";
import { ImageBackground, TouchableOpacity } from "react-native";
import { DateData } from "react-native-calendars";
import { Text } from "@/design-system/base/text";
import { Box } from "@/design-system/base/box";
import { StyleSheet } from "react-native";

interface DayComponentProps {
  date: DateData;
  state?: string;
  onPress?: (date: DateData) => void;
  selected?: boolean;
  image?: string;
}

export const CustomDayComponent = memo(
  ({ date, state, onPress, selected, image }: DayComponentProps) => {
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
            <Text color="ink" variant="caption">
              {date.day}
            </Text>
          </ImageBackground>
        </TouchableOpacity>
      );
    }

    return (
      <Box marginBottom="xs" justifyContent="center" alignItems="center" width={40} height={45}>
        <Box
          justifyContent="center"
          alignItems="center"
          width={40}
          height={45}
          borderRadius="s"
          overflow="hidden"
          borderWidth={state === "today" || selected ? 2 : 0}
          borderColor={state === "today" ? "honey" : selected ? "ink" : undefined}
        >
          <Text color="ink" variant="caption">
            {date.day}
          </Text>
        </Box>
      </Box>
    );
  },
);

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
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
});
