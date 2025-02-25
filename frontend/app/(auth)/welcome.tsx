import { Box } from "@/design-system/base/box";
import Illustration from "@/assets/splash-screen-illustration.svg";
import { Text } from "@/design-system/base/text";
import Carousel from "react-native-reanimated-carousel";
import { useRef, useState } from "react";
import { Dimensions, Keyboard, TouchableWithoutFeedback } from "react-native";
import { TextButton } from "@/design-system/components/ui/text-button";
import { router } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import LoginModal from "./components/login-popup";
import { SPLASH_SCREEN_INFO } from "@/constants/splash-screen";

interface SplashScreenContent {
  header: string;
  caption: string;
}

const Welcome = () => {
  const [page, setPage] = useState<number>(0);
  const { width } = Dimensions.get("window");
  const loginRef = useRef<BottomSheet>(null);

  const renderItem = ({ item }: { item: SplashScreenContent }) => (
    <Box alignContent="center" justifyContent="flex-start" alignItems="flex-start" gap="m">
      <Illustration />
      <Box gap="xs" width="95%">
        <Text variant="bodyLargeBold">{item.header}</Text>
        <Text variant="body">{item.caption}</Text>
      </Box>
    </Box>
  );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
      <Box backgroundColor="pearl" flex={1} justifyContent="center" alignItems="center">
        <Box gap="l" width="100%" padding="m">
          <Box>
            <Text variant="bodyLargeBold">Welcome to</Text>
            <Text variant="h1">Dearly</Text>
          </Box>
          <Carousel
            loop={false}
            overscrollEnabled={false}
            snapEnabled={true}
            width={width}
            height={width * 1.05}
            defaultIndex={0}
            style={{ position: "relative" }}
            data={SPLASH_SCREEN_INFO}
            onProgressChange={(_, index) => setPage(Math.round(index))}
            renderItem={renderItem}
          />
          <Box flexDirection="row" width="100%" justifyContent="center" alignItems="center">
            {SPLASH_SCREEN_INFO.map((_, index) => (
              <Box
                key={index}
                width={8}
                height={8}
                borderRadius="s"
                margin="xs"
                backgroundColor={index === page ? "ink" : "honey"}
              />
            ))}
          </Box>
          <Box gap="m" width="100%">
            <TextButton
              variant="honeyRounded"
              label="Get Started"
              onPress={() => router.push("/(auth)/register")}
            />
            <TextButton
              variant="blushRounded"
              label="Login"
              onPress={() => loginRef.current?.snapToIndex(0)}
            />
          </Box>
        </Box>
        <LoginModal ref={loginRef} />
      </Box>
    </TouchableWithoutFeedback>
  );
};

export default Welcome;
