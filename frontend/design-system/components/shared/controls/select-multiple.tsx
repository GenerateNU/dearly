import { Theme } from "@/design-system/base/theme";
import { DropdownItem } from "@/types/dropdown";
import { useTheme } from "@shopify/restyle";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { ActivityIndicator } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useDropdownContext } from "@/contexts/nudge-dropdown";

interface MultipleSelectDropdownProps {
  id: string;
  value: string[] | null;
  items: DropdownItem[];
  setValue: Dispatch<SetStateAction<string[] | null>>;
  setItems: Dispatch<SetStateAction<DropdownItem[]>>;
  isLoading?: boolean;
  onEndReached?: () => void;
  direction?: "BOTTOM" | "TOP" | "DEFAULT";
}

export const SelectMultipleDropdown: React.FC<MultipleSelectDropdownProps> = ({
  id,
  value,
  items,
  setValue,
  setItems,
  isLoading = false,
  onEndReached,
  direction,
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
        multiple={true as true}
        placeholder={isLoading ? "Loading groups..." : "Group to post to"}
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
