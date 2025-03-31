import User from "@/design-system/components/profiles/user";
import { useLocalSearchParams } from "expo-router";
import { Box } from "@/design-system/base/box";

const Index = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Box flex={1} className="mt-[23%]">
      <User id={id} />
    </Box>
  );
};

export default Index;
