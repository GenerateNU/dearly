import { memo } from "react";
import { ImageBackground, TouchableOpacity } from "react-native";
import { DateData } from "react-native-calendars";
import { Text } from "@/design-system/base/text";
import { Box } from "@/design-system/base/box";
import { StyleSheet } from "react-native";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";

interface DayComponentProps {
  date: DateData;
  state?: string;
  onPress?: (date: DateData) => void;
  selected?: boolean;
  image?: string;
}

export const CustomDayComponent = memo(
  ({ date, state, onPress, selected, image }: DayComponentProps) => {
    const theme = useTheme<Theme>();

    if (!date || typeof date !== "object" || !date.dateString) {
      return null;
    }

    return (
      <TouchableOpacity
        onPress={() => onPress && onPress(date)}
        activeOpacity={0.7}
        style={styles.dayComponentWrapper}
      >
        {image ? (
          <ImageBackground
            source={{ uri: image }}
            style={[
              styles.dayContainer,
              state === "today" && {
                borderWidth: 2,
                borderColor: theme.colors.honey,
              },
              selected && {
                borderWidth: 2,
                borderColor: theme.colors.ink,
              },
            ]}
            imageStyle={styles.imageStyle}
          >
            <Text color="ink" variant="caption">
              {date.day}
            </Text>
          </ImageBackground>
        ) : (
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
        )}
      </TouchableOpacity>
    );
  },
);

CustomDayComponent.displayName = "CustomDayComponent";

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
  imageStyle: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
});
