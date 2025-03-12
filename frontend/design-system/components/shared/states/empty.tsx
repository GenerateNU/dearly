import { Box } from "@/design-system/base/box";
import Illustration from "@/assets/splash-screen-illustration.svg";
import { Text } from "@/design-system/base/text";
import { ReactNode } from "react";

interface EmptyDataProps {
  children?: ReactNode;
  title?: string;
}

const EmptyDataDisplay = ({ children, title = "Nothing to see here!" }: EmptyDataProps) => {
  return (
    <Box flex={1} width="100%" gap="m" justifyContent="center">
      <Box width="100%" alignContent="center" gap="m">
        <Illustration width="100%" />
        <Box width="100%" marginTop="m">
          <Text variant="bodyLargeBold">{title}</Text>
        </Box>
      </Box>
      {children}
    </Box>
  );
};

export default EmptyDataDisplay;
