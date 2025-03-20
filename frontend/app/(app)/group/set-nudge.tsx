import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { useEffect, useState } from "react";
import { Text } from "@/design-system/base/text";
import WeeklyNudgeSettings from "./components/weekly-nudge-settings";
import { useNudgeSettings } from "@/contexts/nudge-settings";

const SetRecurringNudge = () => {
  const FREQUENCY_OPTIONS = ["Disabled", "Daily", "Twice a Week", "Weekly", "Biweekly", "Monthly"];
  const [items, setItems] = useState<DropdownItem[]>(
    FREQUENCY_OPTIONS.map((item) => ({ value: item, label: item })),
  );

  const { frequency, setFrequency } = useNudgeSettings();

  // Sets the schedule
  const onPress = () => {
    // TODO: call nudge endpoint
  };

  return (
    <SafeAreaView className="flex-1">
      <Box
        width="100%"
        paddingTop="xl"
        padding="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
        gap="m"
      >
        <Text variant="bodyLargeBold">Set Recurring Nudges</Text>
        <Text variant="caption">SELECT FREQUENCY</Text>
        <Dropdown value={frequency} items={items} setValue={setFrequency} setItems={setItems} />
        <Box width="100%" alignItems="center">
          <Box width="25%">
            <TextButton onPress={() => null} label="Save" variant="primary" />
          </Box>
          {frequency === "Weekly" && <WeeklyNudgeSettings />}
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default SetRecurringNudge;
