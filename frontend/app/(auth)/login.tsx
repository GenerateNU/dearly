import Box from "@/design-system/base/box";
import LoginForm from "./components/login-form";
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from "react-native";

const Login = () => {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Box
          backgroundColor="primary"
          className="w-full"
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="l"
        >
          <LoginForm />
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;
