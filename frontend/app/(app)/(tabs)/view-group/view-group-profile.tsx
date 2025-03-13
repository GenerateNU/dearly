import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Avatar } from "@/design-system/components/ui/avatar";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { TextButton } from "@/design-system/components/ui/text-button";

interface UserProps {
    itemKey: number,
    name: string,
    profilePhoto: string,
    managerView: boolean,
    role: string
}
const ViewGroupProfile = ({ itemKey, name, profilePhoto, managerView, role } : UserProps) => {
    const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;

    const nudge = () => {
        console.log(`Nudging ${name}`)
    }

    return (
        <Box gap="m" flexDirection="row" alignItems="center" justifyContent="flex-start" key={itemKey}>
            <Box>
                <Avatar variant="small" profilePhoto={profile}/>
            </Box>
            <Box>
                <Text>{name}</Text>
            </Box>
            {managerView && role === "MEMBER" && 
                <Box>
                    <TextButton onPress={nudge} label="Nudge" disabled={false} variant="honeyRounded"/>
                </Box>
            }
        </Box>
    );
}

export default ViewGroupProfile;