import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";

interface ImagePlaceholderProps {
  dimension: number;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ dimension }) => {
  return (
    <Box
      borderRadius="s"
      backgroundColor="slate"
      height={dimension}
      width={dimension}
      justifyContent="center"
      alignItems="center"
    >
      <Text color="pearl">Add photos</Text>
    </Box>
  );
};

export default ImagePlaceholder;
