import { Box } from "@/design-system/base/box";
import { DEFAULT_PROFILE_PHOTO } from "@/constants/photo";
import { Text } from "@/design-system/base/text";
import { Avatar } from "../shared/avatar";
import { SearchedUser } from "@/types/user";
import { Pressable } from "react-native";
import { router } from "expo-router";

export const LikeCard: React.FC<SearchedUser> = ({ name, profilePhoto, username, id }) => {
  const profile = profilePhoto ? profilePhoto : DEFAULT_PROFILE_PHOTO;

  return (
    <Box width="100%">
      <Pressable className="w-[100%]" onPress={() => router.push(`/(app)/user/${id}`)}>
        <Box
          gap="m"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          paddingVertical="m"
        >
          <Box>
            <Avatar variant="small" profilePhoto={profile} />
          </Box>
          <Box>
            <Text variant="bodyBold">@{username}</Text>
            {name && <Text variant="body">{name}</Text>}
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
};
