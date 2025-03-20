import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { useState } from "react";
import { Text } from "@/design-system/base/text";

const SetRecurringNudge = () => {
  const FREQUENCY_OPTIONS = ["Disabled", "Daily", "Twice a Week", "Weekly", "Biweekly", "Monthly"];
  const [option, setOption] = useState<string | null>(null);
  const [items, setItems] = useState<DropdownItem[]>(
    FREQUENCY_OPTIONS.map((item) => ({ value: item, label: item })),
  );

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
        <Dropdown value={option} items={items} setValue={setOption} setItems={setItems} />
        <Box width="100%" alignItems="center">
          <Box width="25%">
            <TextButton onPress={() => null} label="Save" variant="primary" />
          </Box>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default SetRecurringNudge;
