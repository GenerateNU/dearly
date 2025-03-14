import { formatTime } from "@/utilities/time";
import { Pressable } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Avatar } from "../shared/avatar";
import { TextButton } from "../shared/buttons/text-button";
interface PostHeaderProps {
  username: string;
  profilePhoto: string | null;
  location: string | null;
  createdAt: string;
  name: string | null;
  onPress: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  username,
  profilePhoto,
  createdAt,
  name,
  location,
  onPress,
}) => {
  return (
    <Box flexDirection="row" justifyContent="space-between" alignItems="center">
      <Box flexDirection="row" gap="s" justifyContent="space-between">
        <Pressable onPress={onPress}>
          <Avatar variant="small" profilePhoto={profilePhoto} />
        </Pressable>
        <Box flexDirection="column" justifyContent="center" alignItems="flex-start">
          <TextButton
            variant="text"
            label={name ? name : username}
            onPress={() => null}
          ></TextButton>
          {location && (
            <Box flexDirection="row" justifyContent="flex-start" alignItems="flex-start">
              <Box>
                <Text>📍</Text>
              </Box>
              <Box>
                <Text>{location}</Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Box>
        <Text>{formatTime(createdAt)}</Text>
      </Box>
    </Box>
  );
};
