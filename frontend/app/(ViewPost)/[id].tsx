import { useLocalSearchParams } from "expo-router";
import { getPost } from "@/api/post";
import { useQuery } from "@tanstack/react-query";
import ErrorPage from "./components/errorPage";
import SinglePost from "./components/singlePost";

const ViewPost = () => {
  const { id: postId } = useLocalSearchParams<{ id: string }>();
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["api", "v1", "posts", postId],
    queryFn: async () => await getPost(postId!),
  });

  if (isError) {
    return <ErrorPage error={error} />;
  }

  return !isPending && !isError && data ? <SinglePost data={data} postId={postId} /> : <></>;
};

export default ViewPost;
