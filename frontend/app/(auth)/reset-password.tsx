import { Box } from "@/design-system/base/box";
import ResetPasswordForm from "./components/reset-password-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Keyboard } from "react-native";

const ResetPassword = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} className="h-full">
      <SafeAreaView className="flex-1">
        <Box flex={1} padding="m" gap="m" flexDirection="column" className="w-full">
          <ResetPasswordForm />
        </Box>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ResetPassword;
