import { usePost } from "@/hooks/api/post";
import { useLocalSearchParams } from "expo-router";

const ViewPost = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoading, data, error, refetch } = usePost(id);

  return <></>;
};

export default ViewPost;
