import { Box } from "@/design-system/base/box";
import Illustration from "@/assets/splash-screen-illustration.svg";
import { Text } from "@/design-system/base/text";

export const EmptyPage = () => {
  return (
    <Box width="100%" alignContent="center" gap="m">
      <Illustration width="100%" />
      <Box width="100%">
        <Text variant="bodyLargeBold">Nothing to see here!</Text>
      </Box>
    </Box>
  );
};
