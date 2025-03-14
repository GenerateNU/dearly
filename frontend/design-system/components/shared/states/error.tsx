import { Box } from "@/design-system/base/box";
import Logo from "@/assets/logo.svg";
import { Text } from "@/design-system/base/text";
import { TextButton } from "../buttons/text-button";

interface ErrorDisplayProps {
  title?: string;
  description?: string;
  refresh?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Something went wrong",
  description = "Oops! Something went a bit sideways, but our amazing engineers are on it. Please give it a moment and try refreshing!",
  refresh,
}) => {
  return (
    <Box flex={1} width="100%" justifyContent="center">
      <Box gap="m" marginBottom="m">
        <Logo width={150} height={150} />
        <Text variant="bodyLargeBold">{title}</Text>
        <Text variant="caption">{description}</Text>
      </Box>
      {refresh && (
        <Box>
          <TextButton variant="primary" onPress={refresh} label="Reload Page" />
        </Box>
      )}
    </Box>
  );
};

export default ErrorDisplay;
