import { Box } from "@/design-system/base/box";
import { IconButton } from "@/design-system/components/shared/buttons/icon-button";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";

interface ErrorPageProps {
  error: Error;
}

const ErrorPage = ({ error }: ErrorPageProps) => {
  return (
    <Box width={"100%"} height={"100%"} pt="l">
      <Box width={"90%"} alignItems="flex-start" pt="xxl" pl="s">
        <IconButton variant="text" onPress={() => router.back()} icon="chevron-left" />
      </Box>
      <Box p="xxl" pt="none">
        <Text variant="h2">Oops!</Text>
        <Text variant="body">
          Erm... this is embarrising. The post you are viewing does not exist. Please refresh the
          app and try again.
        </Text>
        <Text variant="caption" color="warning">
          Error: {error.message}
        </Text>
      </Box>
    </Box>
  );
};

export default ErrorPage;
