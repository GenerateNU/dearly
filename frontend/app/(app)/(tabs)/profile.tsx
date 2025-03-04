import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { BaseButton } from "@/design-system/base/button";
import { getUser } from "@/api/user";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/auth/store";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { Profile } from "@/design-system/components/profiles/profile";

const ProfilePage = () => {
  return (
    <Box
      gap="xl"
      alignItems="center"
      padding="l"
      justifyContent="center"
      backgroundColor="pearl"
      flex={1}
    >
      <InfoBar />
      <UserInfo />
    </Box>
  );
};

const InfoBar = () => {
  const username = "";
  const { group } = useUserStore();
  const groupName = group ? group.name : "Unknown";
  const onPressGroupName = () => {
    console.log("shitter");
  };

  return (
    <Box flexDirection="row" width={"100%"} justifyContent="space-between">
      <BaseButton variant="text" onPress={onPressGroupName}>
        <Box flexDirection="row" alignItems="center">
          <Text variant="bodyLarge">{groupName}</Text>
          <Icon name="arrow-down-drop-circle-outline" />
        </Box>
      </BaseButton>

      <BaseButton
        variant="text"
        onPress={() => {
          console.log("settings");
        }}
      >
        <Box flex={1} flexDirection="row" alignItems="center" justifyContent="flex-end">
          <Text fontSize={14}>settings</Text>
          <Icon name="cog-outline" />
        </Box>
      </BaseButton>
    </Box>
  );
};

const UserInfo = () => {
  const { userId } = useUserStore();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["api", "v1", "users", userId],
    queryFn: () => getUser(userId!),
  });

  return !isPending && !isError && data ? (
    <Box width="100%" maxWidth="100%">
      <Profile
        username={data!.username}
        profilePhoto={data!.profilePhoto ? data!.profilePhoto : ""}
        bio={data!.bio ? data!.bio : ""}
        birthday={data!.birthday ? data!.birthday : ""}
        name={data!.name}
      />
    </Box>
  ) : (
    <Box>
      <Text>Loading...</Text>
    </Box>
  );
};
export default ProfilePage;