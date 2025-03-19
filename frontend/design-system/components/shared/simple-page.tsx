import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { TextButton } from "./buttons/text-button";

interface SimplePageProps {
  title: string;
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  onPress: () => void;
  buttonLabel: string;
  description: string;
}

const SimplePage: React.FC<SimplePageProps> = ({
  title,
  isLoading,
  isError,
  error,
  onPress,
  buttonLabel,
  description,
}) => {
  return (
    <Box backgroundColor="pearl" className="w-full" flex={1} padding="m" gap="xl">
      <Box flexDirection="column" alignItems="flex-start" gap="s">
        <Text variant="bodyLargeBold">{title}</Text>
        <Text variant="caption">{description}</Text>
      </Box>
      <Box width="100%" gap="s" alignItems="center" className="w-full">
        <Box>
          <TextButton
            disabled={isLoading}
            label={buttonLabel}
            onPress={onPress}
            variant="primary"
          />
        </Box>
        {isError && <Text color="error">{error?.message}</Text>}
      </Box>
    </Box>
  );
};

export default SimplePage;
