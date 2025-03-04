import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/types/post";
import { getMemberPosts } from "@/api/member";
import { MasonryList } from "@/design-system/components/posts/masonry";

const UserPosts = () => {
  const { userId, group } = useUserStore();
  const p1: Post = {
    id: "1234",
    userId: userId!,
    createdAt: new Date().toISOString(),
    caption: "Hi everyone",
    likes: 2,
    comments: 1,
    isLiked: false,
    profilePhoto: undefined,
    name: "daniel",
    username: "jtorre",
    location: "NEU",
    media: [
      {
        id: "danielforfundies",
        postId: "1234",
        url: "https://dbp.io/static/dbp.jpg",
        type: "PHOTO",
      },
    ],
  };

  const p2: Post = {
    id: "ba035ea2-ed46-4fbf-b994-11404b5bed60",
    userId: userId!,
    createdAt: new Date().toISOString(),
    caption: "Got my PHD!",
    likes: 2,
    comments: 1,
    isLiked: false,
    profilePhoto: undefined,
    name: "dbp.io",
    username: "Daniel Patterson",
    location: "NEU",
    media: [
      {
        id: "youngdaniel",
        postId: "12345",
        url: "https://s44427.pcdn.co/wp-content/uploads/2024/07/Patterson_Daniel_NEU-PHD-55448_Selected.jpg",
        type: "PHOTO",
      },
    ],
  };

  const p3: Post = {
    id: "123456",
    userId: userId!,
    createdAt: new Date().toISOString(),
    caption: "Pixel ooooo ahhhhhhh",
    likes: 2,
    comments: 1,
    isLiked: false,
    profilePhoto: undefined,
    name: "Pixel daniel",
    username: "dbp",
    location: "Outside O.O",
    media: [
      {
        id: "danieloutside",
        postId: "12345669",
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbajKjsetXuSbvhtcfiz3bH4p1b8HGmH0gOA&s",
        type: "PHOTO",
      },
    ],
  };

  const p4: Post = {
    id: "1234563492u3409234",
    userId: "This wont be shown",
    createdAt: new Date().toISOString(),
    caption: "NOSHOW",
    likes: 0,
    comments: 0,
    name: "Noname",
    username: "noname",
    media: [
      {
        id: "will never load",
        postId: "1234563492u3409234",
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbs",
        type: "PHOTO",
      },
    ],
  };

  let listOfPosts: Post[] = [p1, p4, p4, p4, p2, p3, p1, p2, p3, p1, p2, p3, p1, p2, p3];
  const postsPerPage = 15;
  const groupId = group && group.id ? group!.id : "";

  if (group) {
    const { isPending, isError, data, error } = useQuery({
      queryKey: ["api", "v1", "groups", groupId, "members", userId, "posts"],
      queryFn: () => getMemberPosts(groupId, userId!, postsPerPage, 0),
    });
  }

  listOfPosts = listOfPosts.reduce((acc: Post[], curr: Post) => {
    if (curr.userId! === userId) {
      return [...acc, curr];
    }
    return acc;
  }, []);

  return (
    <Box width={"100%"} height={"100%"}>
      <Text variant="bodyLargeBold">Posts</Text>
      <MasonryList posts={listOfPosts} />
    </Box>
  );
};

export default UserPosts;
