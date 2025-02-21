import { Box } from "@/design-system/base/box";
import { MasonryList } from "@/design-system/components/posts/masonry";
import { Text } from "@/design-system/base/text";
import { ScrollView } from "react-native-gesture-handler";
import HomeMenu from "@/design-system/components/ui/home-menu";
import { useState } from "react";
import { ImagePost } from "@/design-system/components/posts/post";
import { TextButton } from "@/design-system/components/ui/text-button";
import { Profile } from "@/design-system/components/ui/profile";
import { RefreshControl } from "react-native";
import { Heart } from "@/design-system/components/posts/heart";
import { Recording } from "@/design-system/components/comments/recording";


const Index = () => {
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

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      className="flex-1 w-full p-5 bg-white"
    >
      <Box gap="l" paddingBottom="l">
        <Box gap="s" alignItems="flex-start" flexDirection="column">
          <Text variant="bodyLargeBold">design system</Text>
          <Box width="100%" flexDirection="row"></Box>
          <Box flexDirection="row" justifyContent="space-evenly">
            <Box width="50%" flexDirection="row" gap="s">
              <Heart like={false} onLike={() => null} variant="iconBlush" />
              <Heart like={true} onLike={() => null} variant="iconHoney" />
            </Box>

            <Box width="100%" gap="s">
              <TextButton variant="halfBlush" label="half blush" onPress={() => null} />
              <TextButton variant="halfHoneyRounded" label="half honey" onPress={() => null} />
            </Box>
          </Box>

          <Box width="100%" gap="s">
            <TextButton variant="fullBlush" label="full blush" onPress={() => null} />
            <TextButton
              variant="fullBlushRounded"
              label="full blush rounded"
              onPress={() => null}
            />
            <TextButton variant="fullHoney" label="full honey" onPress={() => null} />
            <TextButton
              variant="fullHoneyRounded"
              label="full honey rounded"
              onPress={() => null}
            />
            <TextButton variant="fullPearl" label="full pearl" onPress={() => null} />
            <TextButton
              variant="fullPearlRounded"
              label="full pearl rounded"
              onPress={() => null}
            />
          </Box>
        </Box>

        <Box>
          <Text variant="h1">h1</Text>
          <Text variant="h2">h2</Text>
          <Text variant="bodyLargeBold">body large bold</Text>
          <Text variant="bodyLarge">body large</Text>
          <Text variant="button">button</Text>
          <Text variant="body">body</Text>
          <Text variant="caption">caption</Text>
        </Box>

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
          <Recording/>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default Index;
