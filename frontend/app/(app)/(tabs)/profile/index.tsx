import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { getUser } from "@/api/user";
import { useQuery } from "@tanstack/react-query";
import UserInfo from "./components/userInfo";
import UserPosts from "./components/usersPosts";
import { ScrollView } from "react-native-gesture-handler";

const ProfilePage = () => {
  const { userId } = useUserStore();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["api", "v1", "users", userId],
    queryFn: () => getUser(userId!),
  });

  return !isPending && !isError && data ? (
    <ScrollView>
      <Box
        gap="xl"
        alignItems="flex-start"
        padding="l"
        paddingTop="xxl"
        paddingBottom="none"
        justifyContent="center"
        flex={1}
        width="100%"
      >
        <Box padding="m"></Box>
        <UserInfo
          username={data!.username}
          name={data!.name!}
          profilePhoto={data!.profilePhoto ? data!.profilePhoto! : undefined}
          bio={data!.bio ? data!.bio! : undefined}
          birthday={data!.birthday ? data!.birthday! : undefined}
        />
        <Box flex={1} width="100%">
          <UserPosts />
        </Box>
      </Box>
    </ScrollView>
  ) : (
    <Box></Box>
  );
};

export default ProfilePage;
