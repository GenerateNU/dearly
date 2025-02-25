import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import Illustration from "@/assets/splash-screen-illustration.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { BaseButton } from "@/design-system/base/button";
import { useUserState } from "@/auth/provider";

const CheckEmail = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const { forgotPassword } = useUserState();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isDisabled && timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setIsDisabled(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDisabled, timer]);

  const handleResendEmail = async () => {
    await forgotPassword();
    setIsDisabled(true);
    setTimer(60);
  };

  return (
    <SafeAreaView>
      <Box gap="m" padding="m">
        <Box gap="s">
          <Text variant="bodyLargeBold">Check your email</Text>
          <Text>We have sent password recovery instructions to your email.</Text>
        </Box>
        <Illustration width="100%" />
        <Box gap="xs">
          <Text variant="caption">Didn't receive the email?</Text>
          <BaseButton variant="text" onPress={handleResendEmail} disabled={isDisabled}>
            <Text style={{ textDecorationLine: "underline" }} variant="captionBold">
              {isDisabled ? `Resend email (${timer}s)` : "Resend email"}
            </Text>
          </BaseButton>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default CheckEmail;
