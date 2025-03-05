import { Box } from "@/design-system/base/box";
import RegisterForm from "./components/register-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Text } from "@/design-system/base/text";

const Register = () => {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView collapsable={false} className="flex-1">
        <ScrollView
          keyboardDismissMode="interactive"
          className="flex-1"
          keyboardShouldPersistTaps="always"
        >
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
                Create Account
              </Text>
              <RegisterForm />
            </Box>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Register;
