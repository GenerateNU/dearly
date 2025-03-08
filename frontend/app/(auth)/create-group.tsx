import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from "react-native";
import CreateGroupForm from "./components/create-group-form";

const CreateGroup = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 mt-[25%]">
        <Box
          padding="m"
          gap="l"
          width="100%"
          flex={1}
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Text variant="bodyLargeBold">Create Group</Text>
          <CreateGroupForm />
        </Box>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default CreateGroup;
