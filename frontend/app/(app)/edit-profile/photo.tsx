import { Box } from "@/design-system/base/box";
import { Theme } from "@/design-system/base/theme";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { useTheme } from "@shopify/restyle";
import { Image } from "react-native";

interface SelectedPhotoProps {
  uri: string;
  index: number;
  dimension: number;
}

const SelectedPhoto: React.FC<SelectedPhotoProps> = ({ uri, index, dimension }) => {
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
    </Box>
  );
};

export default SelectedPhoto;
