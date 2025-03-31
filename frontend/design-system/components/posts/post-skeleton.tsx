import { AnimatedBox } from "@/design-system/base/animated-box";
import usePulsingAnimation from "@/hooks/component/pulse-animate";

export const PostSkeleton = () => {
  const opacity = usePulsingAnimation();

  return (
    <AnimatedBox flexDirection="column" gap="s" style={{ opacity }}>
      <AnimatedBox
        borderRadius="m"
        paddingVertical="s"
        gap="s"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <AnimatedBox borderRadius="full" backgroundColor="silver" width={70} height={70} />
        <AnimatedBox gap="s" width="55%">
          <AnimatedBox borderRadius="s" backgroundColor="silver" height={25} width="70%" />
          <AnimatedBox borderRadius="s" backgroundColor="silver" height={25} width="80%" />
        </AnimatedBox>
      </AnimatedBox>
      <AnimatedBox borderRadius="m" backgroundColor="silver" width="100%" aspectRatio={1} />
      <AnimatedBox borderRadius="s" backgroundColor="silver" height={30} width="60%" />
      <AnimatedBox borderRadius="s" backgroundColor="silver" height={50} width="100%" />
    </AnimatedBox>
  );
};
