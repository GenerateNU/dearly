import logout from "@/app/(app)/logout";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { SafeAreaView, TextInput } from "react-native";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { useRef, useState } from "react";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

export default function Layout() {
    const carouselRef = useRef<ICarouselInstance>(null);
  const [text, setText] = useState("");
  return (
    <Box width="100%" paddingTop="xxl" padding="m" flex={1} gap="l" alignItems="center">
      <Box paddingTop="xxl" width="100%" gap="s">
        <Text variant="body">Name</Text>
      </Box>
      <TextButton
        onPress={() =>
          DateTimePickerAndroid.open({
            value: new Date(),
            onChange: (event, selectedDate) => {
              if (selectedDate) {
                console.log("Selected Date:", selectedDate);
              }
            },
            mode: "date",
          })
        }
        label="Pick a Date"
        variant="secondary"
      />

      <TextButton
        onPress={() => router.push("/(app)/edit-profile")}
        label="Save"
        variant="primary"
      />
    </Box>
  );
}
