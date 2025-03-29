import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { getUser } from "@/api/user";
import { useQuery } from "@tanstack/react-query";
import UserInfo from "./components/userInfo";
import UserPosts from "./components/usersPosts";
import { ScrollView } from "react-native-gesture-handler";
import ResourceView from "@/design-system/components/utilities/resource-view";
import Spinner from "@/design-system/components/shared/spinner";
import ErrorDisplay from "@/design-system/components/shared/states/error";

const ProfilePage = () => {
  const { userId } = useUserStore();

  const { isLoading, data, error, refetch, isRefetching } = useQuery({
    queryKey: ["api", "v1", "users", userId],
    queryFn: () => getUser(userId!),
  });

  const SuccessComponent = () => {
    return (
      <ScrollView>
        <Box
          gap="xl"
          alignItems="flex-start"
          padding="m"
          paddingBottom="none"
          justifyContent="center"
          flex={1}
          width="100%"
        >
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
    );
  };

  const state = {
    loading: isLoading || isRefetching,
    data,
    error: error ? error.message : null,
  };

  return (
    <ResourceView
      resourceState={state}
      successComponent={<SuccessComponent />}
      loadingComponent={
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner />
        </Box>
      }
      errorComponent={
        <Box padding="m" flex={1} justifyContent="center" alignItems="center">
          <ErrorDisplay refresh={refetch} />
        </Box>
      }
    />
  );
};

export default ProfilePage;
