import Box from "@/design-system/base/box";
import RegisterForm from "./components/register-form";
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from "react-native";

const Register = () => {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Box
          className="w-full"
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="l"
        >
          <RegisterForm />
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Register;
