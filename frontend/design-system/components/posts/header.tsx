import { formatTime } from "@/utilities/time";
import { Pressable } from "react-native";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Avatar } from "../shared/avatar";
import { TextButton } from "../shared/buttons/text-button";
import { router } from "expo-router";

interface PostHeaderProps {
  username: string;
  id: string;
  profilePhoto: string | null;
  location: string | null;
  createdAt: string;
  name: string | null;
  onPress: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  username,
  profilePhoto,
  id,
  createdAt,
  location,
  onPress,
}) => {
  return (
    <Box width="100%" flexDirection="row" justifyContent="space-between" alignItems="center">
      <Box flexDirection="row" gap="s" justifyContent="space-between">
        <Pressable onPress={onPress}>
          <Avatar variant="small" profilePhoto={profilePhoto} />
        </Pressable>
        <Box flexDirection="column" justifyContent="center" alignItems="flex-start">
          <TextButton
            variant="text"
            label={username}
            onPress={() => router.push(`/(app)/user/${id}`)}
          ></TextButton>
          {location && (
            <Box flexDirection="row" justifyContent="flex-start" alignItems="center">
              <Box>
                <Text>📍</Text>
              </Box>
              <Text
                variant="caption"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flexShrink: 1, maxWidth: 150 }}
              >
                {location.length > 15 ? location.substring(0, 15) + "..." : location}
              </Text>
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
