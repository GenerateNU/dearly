import Box from "@/design-system/base/box";
import ImageCarousel from "./carousel";
import { Post } from "@/types/post";

export const ImagePost: React.FC<Post> = ({
  profilePhoto,
  username,
  name,
  id,
  userId,
  createdAt,
  location,
  isLiked,
  comments,
  likes,
  caption,
}) => {
  const data = [
    "https://jzoblog.wordpress.com/wp-content/uploads/2020/02/quokkasmile.jpg",
    "https://miro.medium.com/v2/resize:fit:1280/0*Ws5H8wCSbHr-1ek_.",
    "https://helios-i.mashable.com/imagery/articles/03afuPZ972JJIev7CJ9oDVd/hero-image.fill.size_1200x1200.v1614267194.png",
    "https://animals.sandiegozoo.org/sites/default/files/inline-images/quokka06.jpg",
    "https://rottnestexpress.imgix.net/2019/07/REX-Experiences-Quokka-4.jpg?fit=crop&w=500&h=595&dpr=2.625&q=25&auto=format",
    "https://rottnestexpress.imgix.net/2022/08/REX-Experiences-Quokka-4-scaled.jpg?fit=crop&w=500&h=595&dpr=2.625&q=25&auto=format",
  ];

  return (
    <Box flexDirection="column" gap="s">
          <PostHeader 
                username={username} 
                profilePhoto={profilePhoto} 
                location={location} 
                createdAt={createdAt}
            />
            <ImageCarousel 
                like={isLiked}
                data={data}
            />
            <CommentLike 
                postId={id} 
                likes={likes} 
                comments={comments}
            />
    </Box>
  );
};
