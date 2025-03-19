import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { getAllMembers } from "@/api/member";
import { useUserStore } from "@/auth/store";
import { useQuery } from "@tanstack/react-query";
import ViewGroupProfile from "../../group/components/view-group-profile";

interface ViewGroupProps {
  groupId: string;
}

interface GroupMember {
  id: string;
  name: string;
  username: string;
  profilePhoto: string | null;
  role: string;
  notificationsEnabled: boolean;
  lastNudgedAt?: Date | null;
}

const ViewGroup = ({ groupId }: ViewGroupProps) => {
  const { userId } = useUserStore();
  groupId = "0cad2e15-85b9-4680-a776-cb5292d0ba30";

  const { isPending, data, isError, error } = useQuery({
    queryKey: ["api", "v1", "groups", groupId, "members"],
    queryFn: () => getAllMembers(groupId!),
  });

  // TODO: fix this T-T
  let isManager = false;
  if (data) {
    const memberData = [...data];
    for (let i = 0; i < memberData.length; i++) {
      if (memberData[i].role === "MANAGER" && memberData[i].id === userId) isManager = true;
    }
  }

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
      <Text paddingBottom="l" variant="bodyLargeBold">
        View Group
      </Text>
      <Box>
        {data &&
          data.map((profile: GroupMember, index: number) => {
            return (
              <Box
                gap="xl"
                alignItems="flex-start"
                padding="l"
                paddingTop="xxl"
                paddingBottom="none"
                justifyContent="flex-start"
                backgroundColor="pearl"
                flex={1}
                height="100%"
              >
                <ViewGroupProfile
                  itemKey={index}
                  name={profile.name}
                  profilePhoto={profile.profilePhoto ?? ""}
                  managerView={isManager}
                  role={profile.role}
                />
              </Box>
            );
          })}
      </Box>
    </Box>
  ) : (
    <Box>
      <Text>Unable to retrieve member data.</Text>
    </Box>
  );
};

export default ViewGroup;
