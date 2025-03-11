import { Box } from "@/design-system/base/box";
import Illustration from "@/assets/splash-screen-illustration.svg";
import { Text } from "@/design-system/base/text";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { useRef, useState, useEffect } from "react";
import { Dimensions, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SPLASH_SCREEN_INFO } from "@/constants/splash-screen";
import { FadeIn, FadeInDown, SlideInDown } from "react-native-reanimated";
import { AnimatedBox } from "@/design-system/base/animated-box";
import { useOnboarding } from "@/contexts/onboarding";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";

interface SplashScreenContent {
  header: string;
  caption: string;
}

const Welcome = () => {
  const [page, setPage] = useState<number>(0);
  const onboarding = useOnboarding();
  const { width } = Dimensions.get("window");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<ICarouselInstance>(null);
  const { loginWithBiometrics } = useUserStore();

  const renderItem = ({ item }: { item: SplashScreenContent }) => (
    <AnimatedBox entering={FadeIn.duration(1000).delay(300)}>
      <Box alignContent="center" justifyContent="flex-start" alignItems="flex-start" gap="m">
        <Illustration width="95%" />
        <Box gap="xs" width="95%">
          <Text variant="bodyLargeBold">{item.header}</Text>
          <Text variant="body">{item.caption}</Text>
        </Box>
      </Box>
    </AnimatedBox>
  );

  useEffect(() => {
    loginWithBiometrics();
  }, []);

  const onLoginPress = async () => {
    router.push("/(auth)/login");
  };

  const handleGetStarted = () => {
    onboarding.setPage(1);
    router.push("/(auth)/mode");
  };

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
              width={width * 0.95}
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
              <TextButton variant="honeyRounded" label="Get Started" onPress={handleGetStarted} />
              <TextButton variant="blushRounded" label="Login" onPress={onLoginPress} />
            </Box>
          </AnimatedBox>
        </Box>
      </Box>
    </TouchableWithoutFeedback>
  );
};

export default Welcome;
