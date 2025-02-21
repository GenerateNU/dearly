import { Box } from "@/design-system/base/box";
import { MasonryList } from "@/design-system/components/posts/masonry";
import { Text } from "@/design-system/base/text";
import { ScrollView } from "react-native-gesture-handler";
import HomeMenu from "@/design-system/components/ui/home-menu";
import { useRef, useState } from "react";
import { ImagePost } from "@/design-system/components/posts/post";
import { Profile } from "@/design-system/components/ui/profile";
import { RefreshControl } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { SelectItem } from "@/design-system/components/ui/select";
import { Group } from "@/types/group";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";

const families: Group[] = [
  { id: "1", name: "Family 1" },
  { id: "2", name: "Family 2" },
  { id: "3", name: "Family 3" },
];

const ComponentLibrary = () => {
  const [menu1, setMenu1] = useState("Home");
  const [menu2, setMenu2] = useState("Home");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const data = [
    "https://assets.wwf.org.au/image/upload/c_fill,g_auto,w_1400/f_auto/q_auto/v1/website-media/news-blogs/quokka?q=75",
    "https://miro.medium.com/v2/resize:fit:1280/0*Ws5H8wCSbHr-1ek_.",
    "https://www.stancsmith.com/uploads/4/8/9/6/48964465/76ce9ab1ca225c7ef0af8e63ace06da7d4cb5c56_orig.jpg",
    "https://i.pinimg.com/736x/58/25/ff/5825ff976305fca746c0c6ad7abbb475.jpg",
    "https://rottnestexpress.imgix.net/2022/08/REX-Experiences-Quokka-4-scaled.jpg?fit=crop&w=500&h=595&dpr=2.625&q=25&auto=format",
  ];

  const commentRef = useRef<BottomSheet>(null);
  const likeRef = useRef<BottomSheet>(null);
  const [selectedFamily, setSelectedFamily] = useState<Group>(
    families[0] ?? { id: "0", name: "Default Family" },
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        className="flex-1 w-full p-5 bg-white"
      >
        <Box gap="l" paddingBottom="l">
          <Box gap="s">
            <Text variant="bodyLargeBold">home menu</Text>
            <HomeMenu categories={["Home", "Calendar"]} selected={menu1} setSelected={setMenu1} />
            <HomeMenu
              categories={["Home", "Calendar", "Album"]}
              selected={menu2}
              setSelected={setMenu2}
            />
          </Box>

          <Box>
            <Text variant="bodyLargeBold">a post</Text>
            <ImagePost
              onCommentClicked={() => commentRef.current?.snapToIndex(0)}
              onLikeClicked={() => likeRef.current?.snapToIndex(0)}
              id=""
              groupId=""
              userId=""
              createdAt={new Date().toISOString()}
              caption="quokka the setonix brachyurus aka the cutest animal in the world"
              likes={3}
              profilePhoto="https://avatars.githubusercontent.com/u/123816878?v=4"
              comments={2}
              username="user"
              media={data.map((item) => ({
                id: "",
                postId: "",
                url: item,
                type: "PHOTO",
              }))}
              isLiked={false}
              name="quokka"
              location="in the sherm"
            />
          </Box>

          <Box>
            <Text variant="bodyLargeBold">masonry feed</Text>
            <MasonryList data={data} />
          </Box>

          <Box>
            <Text variant="bodyLargeBold">user profile</Text>
            <Profile
              profilePhoto="https://i.pinimg.com/736x/f9/fe/de/f9fedee21e1fb9ff8c0522a2756180bd.jpg"
              bio="quokka the cutest animal with the cutest smile"
              birthday={new Date().toISOString()}
              name="Quokka"
              username="quokka"
            />
          </Box>

          <Box>
            <Text variant="bodyLargeBold">select item</Text>
            <SelectItem
              selected={selectedFamily}
              setSelected={setSelectedFamily}
              data={families}
              renderLabel={(item: Group) => item.name}
            />
          </Box>
        </Box>
      </ScrollView>
      <CommentPopUp id="" ref={commentRef} />
      <CommentPopUp id="" ref={likeRef} />
    </>
  );
};

export default ComponentLibrary;
