import React, { useState, useEffect } from "react";
import { Theme } from "@/design-system/base/theme";
import { DropdownItem } from "@/types/dropdown";
import { useTheme } from "@shopify/restyle";
import DropDownPicker from "react-native-dropdown-picker";
import { ActivityIndicator } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useDropdownContext } from "@/contexts/nudge-dropdown";

interface DropdownProps {
  id: string;
  value: string | null;
  items: DropdownItem[];
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
  setItems: React.Dispatch<React.SetStateAction<DropdownItem[]>>;
  isLoading?: boolean;
  onEndReached?: () => void;
  direction?: "BOTTOM" | "TOP" | "DEFAULT";
  placeholder: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  value,
  items,
  setValue,
  setItems,
  isLoading = false,
  onEndReached,
  direction,
  placeholder,
}) => {
  const { openDropdownId, openDropdown, closeDropdown } = useDropdownContext();
  const theme = useTheme<Theme>();

  const pearlColor = theme.colors.pearl;
  const [isOpen, setIsOpen] = useState(false);

  const CustomActivityIndicator = () => {
    return isLoading ? <ActivityIndicator size="small" color={theme.colors.gray} /> : <></>;
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openDropdown(id);
      setIsOpen(true);
    } else {
      closeDropdown(id);
      setIsOpen(false);
    }
  };

  // Ensure only one dropdown is open at a time
  useEffect(() => {
    if (openDropdownId !== id) {
      setIsOpen(false);
    }
  }, [openDropdownId, id]);

  const zValue = isOpen ? 1000 : 1;

  return (
    <Box zIndex={zValue}>
      <DropDownPicker
        open={isOpen}
        setOpen={handleOpenChange as any}
        dropDownDirection={direction}
        value={value}
        items={items}
        setValue={setValue}
        setItems={setItems}
        placeholder={isLoading ? "Loading..." : placeholder}
        placeholderStyle={{
          color: theme.colors.gray,
          opacity: 0.5,
          width: "80%",
        }}
        style={{
          backgroundColor: pearlColor,
          overflow: "hidden",
          zIndex: zValue,
        }}
        dropDownContainerStyle={{
          backgroundColor: pearlColor,
          zIndex: zValue,
        }}
        listItemContainerStyle={{
          backgroundColor: pearlColor,
          borderRadius: 20,
        }}
        disabled={isLoading}
        ListEmptyComponent={() =>
          isLoading ? (
            <Box
              borderTopLeftRadius="s"
              borderTopRightRadius="s"
              backgroundColor="pearl"
              padding="s"
              alignItems="center"
              zIndex={zValue}
            >
              <ActivityIndicator size="small" color={theme.colors.gray} />
            </Box>
          ) : (
            <Box
              borderTopLeftRadius="s"
              borderTopRightRadius="s"
              backgroundColor="pearl"
              padding="s"
              alignItems="center"
              zIndex={zValue}
            >
              <Text variant="caption">You are not in a group</Text>
            </Box>
          )
        }
        ActivityIndicatorComponent={CustomActivityIndicator}
        showArrowIcon={!isLoading}
        showTickIcon={!isLoading}
        flatListProps={{
          onEndReached: onEndReached,
          onEndReachedThreshold: 0.5,
          showsVerticalScrollIndicator: false,
        }}
        bottomOffset={80}
      />
    </Box>
  );
};
