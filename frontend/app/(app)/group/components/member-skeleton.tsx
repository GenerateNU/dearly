import { AnimatedBox } from "@/design-system/base/animated-box";
import usePulsingAnimation from "@/hooks/component/pulse-animate";

const MemberSkeleton = () => {
  const opacity = usePulsingAnimation();

  return (
    <AnimatedBox
      borderRadius="m"
      paddingVertical="s"
      gap="s"
      flexDirection="row"
      justifyContent="space-between"
      alignContent="center"
      alignItems="center"
      style={{ opacity }}
    >
      <AnimatedBox borderRadius="full" backgroundColor="silver" width={70} height={70} />
      <AnimatedBox gap="s" width="40%">
        <AnimatedBox borderRadius="s" backgroundColor="silver" height={25} width="100%" />
        <AnimatedBox borderRadius="s" backgroundColor="silver" height={25} width="80%" />
      </AnimatedBox>
      <AnimatedBox backgroundColor="silver" borderRadius="l" width={80} height={40} />
      <AnimatedBox gap="xs" borderRadius="l">
        <AnimatedBox borderRadius="full" backgroundColor="silver" width={7} height={7} />
        <AnimatedBox borderRadius="full" backgroundColor="silver" width={7} height={7} />
        <AnimatedBox borderRadius="full" backgroundColor="silver" width={7} height={7} />
      </AnimatedBox>
    </AnimatedBox>
  );
};

export default MemberSkeleton;
