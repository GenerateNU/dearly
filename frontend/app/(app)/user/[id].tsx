import User from "@/design-system/components/profiles/user";
import { useLocalSearchParams } from "expo-router";

const Index = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <User id={id} />;
};

export default Index;
