import { Box } from "@/design-system/base/box";
import User from "@/design-system/components/profiles/user";
import { useLocalSearchParams } from "expo-router";

const Index = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Box className="mt-[25%]">
      <User id={id} />
    </Box>
  );
};

export default Index;
