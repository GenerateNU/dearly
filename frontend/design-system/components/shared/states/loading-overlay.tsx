import { Box } from "@/design-system/base/box";
import Spinner from "../spinner";
import { Text } from "@/design-system/base/text";

const LoadingOverlay = ({ message }: { message: string }) => {
  return (
    <Box position="absolute" top={0} bottom={0} left={0} right={0} zIndex={9999}>
      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
        backgroundColor="ink"
        opacity={0.6}
      />

      <Box flex={1} alignItems="center" justifyContent="center">
        <Spinner />
        <Text color="pearl" marginTop="m">
          {message}
        </Text>
        <Text color="pearl" fontSize={14} marginTop="xs">
          This will only take a moment
        </Text>
      </Box>
    </Box>
  );
};

export default LoadingOverlay;
