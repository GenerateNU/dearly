import { Box } from "@/design-system/base/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/design-system/base/text";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import ResetPasswordForm from "../components/reset-password-form";

const ResetPassword = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1">
        <Box flex={1} padding="m" gap="m" flexDirection="column" className="w-full">
          <Text variant="bodyLargeBold">Reset Password</Text>
          <ResetPasswordForm />
        </Box>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ResetPassword;
