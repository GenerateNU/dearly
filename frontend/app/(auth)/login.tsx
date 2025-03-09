import { Box } from "@/design-system/base/box";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import { Text } from "@/design-system/base/text";
import LoginForm from "./components/login-form";

const Login = () => {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView collapsable={false} className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box
            paddingTop="xxl"
            backgroundColor="pearl"
            className="w-full"
            flex={1}
            justifyContent="flex-start"
            alignItems="flex-start"
            paddingHorizontal="m"
          >
            <Text paddingBottom="l" variant="bodyLargeBold">
              Login
            </Text>
            <LoginForm />
          </Box>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Login;
