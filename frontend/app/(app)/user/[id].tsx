import { Box } from "@/design-system/base/box";
import { useLocalSearchParams } from "expo-router";

const Index = () => {
  const { id: postId } = useLocalSearchParams<{ id: string }>();

  return <Box></Box>;
};

export default Index;
