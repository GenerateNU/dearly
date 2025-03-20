import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from "react-native";
import { Box } from "@/design-system/base/box";
import ChangeNameForm from "./components/change-name-form";

const ChangeGroupName = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 mt-[15%]">
        <Box flex={1} paddingBottom="l" padding="m" justifyContent="space-between">
          <ChangeNameForm />
        </Box>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ChangeGroupName;
