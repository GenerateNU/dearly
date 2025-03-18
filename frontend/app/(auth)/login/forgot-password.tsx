import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableWithoutFeedback } from "react-native";
import { Keyboard } from "react-native";
import ForgotPasswordForm from "../components/forgot-password-form";

const ForgotPassword = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1">
        <Box flex={1} padding="m" gap="m" flexDirection="column" className="w-full">
          <Text variant="bodyLargeBold">Reset Password</Text>
          <Text variant="caption">
            Enter the email associated with your account and we'll send an email with instructions
            to reset your password.
          </Text>
          <ForgotPasswordForm />
        </Box>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPassword;
