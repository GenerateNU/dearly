import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";

interface DropdownProps {
  multiple?: boolean;
  loading?: boolean;
}

interface DropdownProps {
  multiple?: boolean;
  loading?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({ multiple = false, loading = false }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);

  return (
    <DropDownPicker
      multiple={multiple}
      loading={loading}
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      style={{ borderWidth: 0 }}
      dropDownContainerStyle={{ borderWidth: 0 }} 
    />
  );
};

