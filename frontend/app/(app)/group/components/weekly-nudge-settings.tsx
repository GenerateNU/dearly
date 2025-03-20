import { Box } from "@/design-system/base/box";
import { Dropdown } from "@/design-system/components/shared/controls/dropdown";
import { DropdownItem } from "@/types/dropdown";
import { Text } from "@/design-system/base/text";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
// Component to render Day of Week drop down and time scroll
const WeeklyNudgeSettings = () => {

    const FREQUENCY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const [option, setOption] = useState<string | null>(null);
      const [time, setTime] = useState<string | null>(null);
      const [open, setOpen] = useState<boolean | null>(null);
      const [items, setItems] = useState<DropdownItem[]>(
        FREQUENCY_OPTIONS.map((item) => ({ value: item, label: item })),
      );

    return (
        <Box>
            <Box>
              <Text variant="caption">SELECT DAY</Text>
              <Dropdown value={option} items={items} setValue={setOption} setItems={setItems} />
            </Box>
            <DateTimePicker
              mode="time"
              onChange={(_, date) => {console.log(date)}}
              textColor="black"
              display="spinner"
              value={new Date()}
            />
        </Box>
    )
}

export default WeeklyNudgeSettings;

