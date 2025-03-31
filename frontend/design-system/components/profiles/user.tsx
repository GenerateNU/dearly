import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { ScrollView } from "react-native-gesture-handler";
import ResourceView from "@/design-system/components/utilities/resource-view";
import Spinner from "@/design-system/components/shared/spinner";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import { useUser } from "@/hooks/api/user";
import UserPosts from "@/app/(app)/(tabs)/profile/components/usersPosts";
import UserInfo from "@/app/(app)/(tabs)/profile/components/userInfo";

export const User = ({ id }: { id: string }) => {
  const { isLoading, data, error, refetch, isRefetching } = useUser(id);

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
            <UserPosts id={id} />
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

export default User;
