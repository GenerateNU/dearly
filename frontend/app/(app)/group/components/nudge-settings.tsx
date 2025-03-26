import { Box } from "@/design-system/base/box";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { Text } from "@/design-system/base/text";
import { useState } from "react";
import NudgeAtTimePicker from "./nudge-time-settings";

// Component to render Day of Week drop down and time scroll
interface NudgeSettingProp {
  options: string[] | null;
  curOption: string | null;
  setOption: React.Dispatch<React.SetStateAction<string | null>>;
}

const NudgeSettings: React.FC<NudgeSettingProp> = ({ options, curOption, setOption }) => {
  const [items, setItems] = useState<DropdownItem[]>(
    options?.map((item) => ({ value: item, label: item })) ?? [],
  );

  return (
    <Box>
      {options && items && (
        <Box>
          <Text variant="caption">SELECT DAY</Text>
          <Dropdown
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

export default NudgeSettings;
