import Box from "@/design-system/base/box";

interface PostHeaderProps {
  username: string;
  profilePhoto: string | null;
  location: string | null;
  createdAt: string;
  name: string | null;
}

export const PostHeader: React.FC<PostHeaderProps> = ({username, profilePhoto, createdAt, name}) => {
  return (
    <Box>

    </Box>
  )
}