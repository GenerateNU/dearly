import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { getUser } from "@/api/user";
import { useQuery } from "@tanstack/react-query";
import InfoBar from "./components/profileInfoBar";
import UserInfo from "./components/userInfo";
import UserPosts from "./components/usersPosts";

const ProfilePage = () => {
  const { userId } = useUserStore();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["api", "v1", "users", userId],
    queryFn: () => getUser(userId!),
  });

  return !isPending && !isError && data ? (
    <Box
      gap="xl"
      alignItems="center"
      padding="l"
      paddingTop="xxl"
      paddingBottom="none"
      justifyContent="center"
      backgroundColor="pearl"
      flex={1}
      height="100%"
    >
      <InfoBar />
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
  ) : (
    <Box></Box>
  );
};

export default ProfilePage;
