import { Box } from "@/design-system/base/box";
import { Theme } from "@/design-system/base/theme";
import { Icon } from "@/design-system/components/ui/icon";
import { useTheme } from "@shopify/restyle";
import { Image, Pressable } from "react-native";

interface SelectedPhotoProps {
  uri: string;
  index: number;
  dimension: number;
  onRemove: () => void;
}

const SelectedPhoto: React.FC<SelectedPhotoProps> = ({ uri, index, dimension, onRemove }) => {
  const theme = useTheme<Theme>();

  return (
    <Box marginRight="s" position="relative">
      <Image
        source={{ uri }}
        style={{
          borderRadius: theme.borderRadii.s,
          height: dimension,
          width: dimension,
        }}
      />
      <Pressable onPress={onRemove} className="top-2 right-2 z-10 absolute">
        <Box
          backgroundColor="pearl"
          borderRadius="full"
          padding="xs"
          shadowColor="ink"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.3}
          shadowRadius={3}
          elevation={3}
        >
          <Icon size={20} name="close" />
        </Box>
      </Pressable>
    </Box>
  );
};

export default SelectedPhoto;
