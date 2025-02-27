import { Box } from "@/design-system/base/box";
import Illustration from "@/assets/splash-screen-illustration.svg";
import { Text } from "@/design-system/base/text";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { useRef, useState, useEffect } from "react";
import { Dimensions, Keyboard, TouchableWithoutFeedback } from "react-native";
import { TextButton } from "@/design-system/components/ui/text-button";
import BottomSheet from "@gorhom/bottom-sheet";
import LoginModal from "./components/login-popup";
import { SPLASH_SCREEN_INFO } from "@/constants/splash-screen";
import { FadeIn, FadeInDown, SlideInDown } from "react-native-reanimated";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { useOnboarding } from "@/contexts/onboarding";

interface SplashScreenContent {
  header: string;
  caption: string;
}

const Welcome = () => {
  const [page, setPage] = useState<number>(0);
  const { setPage: setOnboardingPage } = useOnboarding();
  const { width } = Dimensions.get("window");
  const loginRef = useRef<BottomSheet>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<ICarouselInstance>(null);

  const renderItem = ({ item }: { item: SplashScreenContent }) => (
    <AnimatedBox entering={FadeIn.duration(1000).delay(300)}>
      <Box alignContent="center" justifyContent="flex-start" alignItems="flex-start" gap="m">
        <Illustration />
        <Box gap="xs" width="95%">
          <Text variant="bodyLargeBold">{item.header}</Text>
          <Text variant="body">{item.caption}</Text>
        </Box>
      </Box>
    </AnimatedBox>
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const nextPage = (page + 1) % SPLASH_SCREEN_INFO.length;
      setPage(nextPage);
      if (carouselRef.current) {
        carouselRef.current.scrollTo({ index: nextPage, animated: true });
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [page]);

  const handlePageChange = (index: number) => {
    setPage(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const nextPage = (index + 1) % SPLASH_SCREEN_INFO.length;
        setPage(nextPage);
        if (carouselRef.current) {
          carouselRef.current.scrollTo({ index: nextPage, animated: true });
        }
      }, 5000);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
      <Box backgroundColor="pearl" flex={1} justifyContent="center" alignItems="center">
        <Box gap="l" width="100%" padding="m">
          <AnimatedBox entering={FadeInDown.duration(800)}>
            <Box>
              <Text variant="bodyLargeBold">Welcome to</Text>
              <Text variant="h1">Dearly</Text>
            </Box>
          </AnimatedBox>

          <AnimatedBox entering={FadeIn.duration(1000).delay(200)}>
            <Carousel
              ref={carouselRef}
              loop={false}
              overscrollEnabled={false}
              snapEnabled={true}
              width={width}
              height={width * 1.06}
              defaultIndex={0}
              style={{ position: "relative" }}
              data={SPLASH_SCREEN_INFO}
              onProgressChange={(_, absoluteIndex) => {
                const index = Math.round(absoluteIndex);
                if (index !== page) {
                  handlePageChange(index);
                }
              }}
              renderItem={renderItem}
            />
          </AnimatedBox>

          <AnimatedBox entering={FadeIn.duration(1000).delay(200)}>
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
          </AnimatedBox>

          <AnimatedBox entering={SlideInDown.duration(1000).delay(400)}>
            <Box gap="m" width="100%">
              <TextButton
                variant="honeyRounded"
                label="Get Started"
                onPress={() => setOnboardingPage(1)}
              />
              <TextButton
                variant="blushRounded"
                label="Login"
                onPress={() => loginRef.current?.snapToIndex(0)}
              />
            </Box>
          </AnimatedBox>
        </Box>
        <LoginModal ref={loginRef} />
      </Box>
    </TouchableWithoutFeedback>
  );
};

export default Welcome;
