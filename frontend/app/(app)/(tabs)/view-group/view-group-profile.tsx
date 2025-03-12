import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Avatar } from "@/design-system/components/ui/avatar";
import { Profile } from "@/design-system/components/ui/profile";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { TextButton } from "@/design-system/components/ui/text-button";

interface UserProps {
    name: string,
    profilePhoto: string
    isManager: boolean
}
const ViewGroupProfile = ({ name, profilePhoto, isManager } : UserProps) => {

    console.log(name)
    console.log(profilePhoto)

    const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;

    const nudge = () => {
        console.log(`Nudging ${name}`)
    }

    return (
        <Box gap="m" flexDirection="row" alignItems="center" justifyContent="flex-start">
            <Box>
                <Avatar variant="small" profilePhoto={profile}/>
            </Box>
            <Box>
                <Text>{name}</Text>
            </Box>
            <Box>
                {isManager && 
                    <TextButton variant="text" label="Nudge" onPress={nudge} />
                }    
            </Box>
        </Box>
    );
}

export default ViewGroupProfile;