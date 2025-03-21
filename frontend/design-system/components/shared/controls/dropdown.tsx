import { Theme } from "@/design-system/base/theme";
import { DropdownItem } from "@/types/dropdown";
import { useTheme } from "@shopify/restyle";
import { Dispatch, SetStateAction, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { ActivityIndicator } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";

interface DropdownProps {
  value: string | null;
  items: DropdownItem[];
  setValue: Dispatch<SetStateAction<string | null>>;
  setItems: Dispatch<SetStateAction<DropdownItem[]>>;
  isLoading?: boolean;
  onEndReached?: () => void;
  direction?: "BOTTOM" | "TOP" | "DEFAULT";
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  items,
  setValue,
  setItems,
  isLoading = false,
  onEndReached,
  direction
}) => {
  const [open, setOpen] = useState(false); // TODO: on press to control from outside

  const theme = useTheme<Theme>();

  const pearlColor = theme.colors.pearl;

  const CustomActivityIndicator = () => {
    return isLoading ? <ActivityIndicator size="small" color={theme.colors.gray} /> : <></>;
  };

  return (
    <Box zIndex={10}>
      <DropDownPicker
        open={open}
        dropDownDirection={direction}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder={isLoading ? "Loading groups..." : "Group to post to"}
        placeholderStyle={{
          color: theme.colors.gray,
          opacity: 0.5,
          width: "80%",
        }}
        style={{
          backgroundColor: pearlColor,
          overflow: "hidden",
        }}
        dropDownContainerStyle={{
          backgroundColor: pearlColor,
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
