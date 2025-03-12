import { AnimatedBox } from "@/design-system/base/animated-box";
import usePulsingAnimation from "@/hooks/component/pulse-animate";

const NotificationSkeleton = () => {
  const opacity = usePulsingAnimation();

  return (
    <AnimatedBox
      borderRadius="m"
      paddingVertical="s"
      gap="s"
      flexDirection="row"
      justifyContent="center"
      alignContent="center"
      style={{ opacity }}
    >
      <AnimatedBox borderRadius="full" backgroundColor="silver" width={70} height={70} />
      <AnimatedBox gap="s" width="55%">
        <AnimatedBox borderRadius="s" backgroundColor="silver" height={25} width="100%" />
        <AnimatedBox borderRadius="s" backgroundColor="silver" height={25} width="80%" />
      </AnimatedBox>
      <AnimatedBox backgroundColor="silver" borderRadius="m" width={70} height={70} />
    </AnimatedBox>
  );
};

export default NotificationSkeleton;
