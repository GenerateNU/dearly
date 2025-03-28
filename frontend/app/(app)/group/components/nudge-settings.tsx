import { Box } from "@/design-system/base/box";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { Text } from "@/design-system/base/text";
import { useEffect, useState } from "react";
import NudgeAtTimePicker from "./nudge-time-settings";
import { SelectMultipleDropdown } from "@/design-system/components/shared/controls/select-multiple";

interface NudgeSettingProp {
  options: DropdownItem[];
  curOption: string | null;
  setOption: React.Dispatch<React.SetStateAction<string | null>>;
  showTimePicker?: boolean;
}

export const NudgeSettings: React.FC<NudgeSettingProp> = ({
  options,
  curOption,
  setOption,
  showTimePicker = true,
}) => {
  const [items, setItems] = useState<DropdownItem[]>(options);
  useEffect(() => {
    setItems(options);
  }, [options]);

  return (
    <Box>
      {options && items.length > 0 && (
        <Box gap="xs">
          <Text variant="caption">SELECT DAY</Text>
          <Dropdown
            id="nudge"
            value={curOption}
            items={items}
            setValue={setOption}
            setItems={setItems}
            placeholder="Select time"
          />
        </Box>
      )}
      {showTimePicker && <NudgeAtTimePicker />}
    </Box>
  );
};
NudgeSettings.displayName = "NudgeSettings";

interface NudgeMultipleSelectSettingsProp {
  options: DropdownItem[];
  curOption: string[] | null;
  setOption: React.Dispatch<React.SetStateAction<string[] | null>>;
}

export const NudgeMultipleSelectSettings: React.FC<NudgeMultipleSelectSettingsProp> = ({
  options,
  curOption,
  setOption,
}) => {
  const [items, setItems] = useState<DropdownItem[]>(options);

  return (
    <Box>
      {options && items && (
        <Box gap="xs">
          <Text variant="caption">SELECT DAYS</Text>
          <SelectMultipleDropdown
            id="nudge"
            value={curOption}
            items={items}
            setValue={setOption}
            setItems={setItems}
          />
        </Box>
      )}
      <NudgeAtTimePicker />
    </Box>
  );
};
