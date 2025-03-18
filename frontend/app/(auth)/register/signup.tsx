import { Box } from "@/design-system/base/box";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Text } from "@/design-system/base/text";
import RegisterForm from "../components/register-form";

const Register = () => {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView collapsable={false} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
