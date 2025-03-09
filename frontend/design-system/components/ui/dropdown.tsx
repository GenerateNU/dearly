import { Theme } from "@/design-system/base/theme";
import { DropdownItem } from "@/types/dropdown";
import { useTheme } from "@shopify/restyle";
import { Dispatch, SetStateAction, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";

interface DropdownProps {
  value: string | null;
  items: DropdownItem[];
  setValue: Dispatch<SetStateAction<string | null>>;
  setItems: Dispatch<SetStateAction<DropdownItem[]>>;
}

export const Dropdown: React.FC<DropdownProps> = ({ value, items, setValue, setItems }) => {
  const [open, setOpen] = useState(false);

  const theme = useTheme<Theme>();

  const pearlColor = theme.colors.pearl;

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder="Group to post to"
      placeholderStyle={{
        color: theme.colors.gray,
        opacity: 0.5,
      }}
      style={{
        backgroundColor: pearlColor,
      }}
      listItemContainerStyle={{
        backgroundColor: pearlColor,
        borderRadius: 8,
      }}
    />
  );
};
