import Box from "@/design-system/base/box";
import Text from "@/design-system/base/text";
interface CommentLikeProps {
    postId: string;
    likes: number;
    comments: number;
}

export const CommentLike: React.FC<CommentLikeProps> = () => {
    return (
        <Box>
            <Text></Text>
        </Box>
    )
}