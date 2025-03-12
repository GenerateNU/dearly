import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { getAllMembers } from "@/api/member";
import { useUserStore } from "@/auth/store";
import { useQuery } from "@tanstack/react-query";
import ViewGroupProfile from "./view-group-profile";
import { getItemAsync } from "expo-secure-store";
import { getGroup } from "@/api/group";

interface ViewGroupProps {
    groupId: string;
}

interface UserProps {
    name: string,
    profilePhoto: string,
    isMember: boolean;
}

const ViewGroup = ({ groupId }: ViewGroupProps) => {

    const { userId } = useUserStore();
    groupId = "0cad2e15-85b9-4680-a776-cb5292d0ba30"

    // Get manager
    const groupData = useQuery({
        queryKey: ["api", "v1", "groups", groupId],
        queryFn: () => getGroup(groupId!),
    })

    // let isManager = false;

    console.log(groupData)

    console.log(groupData.data)

    const isManager = groupData.data && groupData.data.managerId === userId

    console.log(`Group data: ${groupData.data}`)

    const memberData = useQuery({
        queryKey: ["api", "v1", "groups", groupId, "members"],
        queryFn: () => getAllMembers(groupId!),
      });


    // console.log(isPending)
    console.log(memberData.data)
    // console.log(error)
    if (memberData.data) {
        memberData.data.map((profile: UserProps) => {
            console.log(profile.name)
            console.log(profile.profilePhoto)
        })

    }

    return !memberData.isPending && !memberData.isError && memberData.data && !groupData.isPending && !groupData.isError && groupData.data ? ( 
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

            {memberData.data && memberData.data.map((profile: UserProps, index: number) => {
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
                        key={index}
                        name={profile.name}
                        profilePhoto={profile.profilePhoto}
                        isManager={isManager}
                    />
                </Box>
                );
            })}
            </Box>
        </Box>
    ): <Box>
        <Text>Unable to retrieve member data.</Text>
    </Box>;
};

export default ViewGroup;

