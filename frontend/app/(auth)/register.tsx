import { Box } from "@/design-system/base/box";
import RegisterForm from "./components/register-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import { Text } from "@/design-system/base/text";

const Register = () => {
  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box
            backgroundColor="pearl"
            className="w-full"
            flex={1}
            justifyContent="flex-start"
            alignItems="flex-start"
            paddingHorizontal="m"
          >
            <Text paddingBottom="l" variant="bodyLargeBold">
              Create Account
            </Text>
            <RegisterForm />
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
