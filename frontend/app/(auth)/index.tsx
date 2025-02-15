import Box from "@/design-system/base/box";
import ImageCarousel from "@/design-system/components/posts/carousel";
import { MasonryList } from "@/design-system/components/posts/masonry";
import Button from "@/design-system/components/ui/button";
import { router } from "expo-router";
import Text from "@/design-system/base/text";
import { ScrollView } from "react-native-gesture-handler";
import HomeMenu from "@/design-system/components/ui/home-menu";
import { useState } from "react";

const Index = () => {
  console.log(process.env.NODE_ENV);
  const [menu, setMenu] = useState("Calendar");
  const data = [
    "https://jzoblog.wordpress.com/wp-content/uploads/2020/02/quokkasmile.jpg",
    "https://miro.medium.com/v2/resize:fit:1280/0*Ws5H8wCSbHr-1ek_.",
    "https://helios-i.mashable.com/imagery/articles/03afuPZ972JJIev7CJ9oDVd/hero-image.fill.size_1200x1200.v1614267194.png",
    "https://animals.sandiegozoo.org/sites/default/files/inline-images/quokka06.jpg",
    "https://rottnestexpress.imgix.net/2019/07/REX-Experiences-Quokka-4.jpg?fit=crop&w=500&h=595&dpr=2.625&q=25&auto=format",
    "https://rottnestexpress.imgix.net/2022/08/REX-Experiences-Quokka-4-scaled.jpg?fit=crop&w=500&h=595&dpr=2.625&q=25&auto=format",
  ];
  return (
    <Box backgroundColor="primary" gap="m" flex={1} justifyContent="center" alignItems="center">
      <ScrollView className="flex-1 w-full p-5 mt-10">
      <Button label="Login" onPress={() => router.push("/(auth)/login")} />
      <Button label="Register" onPress={() => router.push("/(auth)/register")} />
        <Box gap="l" paddingBottom="l">
          <Box>
            <Text variant="body">Home Menu</Text>
            <HomeMenu categories={["Home", "Calendar"]} selected={menu} setSelected={setMenu} />
          </Box>

          <Box>
            <Text variant="body">Masonry Feed</Text>
            <MasonryList data={data} />
          </Box>

          <Box>
            <Text variant="body">Image Carousel</Text>
            <ImageCarousel like={false} data={data} />
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default Index;
