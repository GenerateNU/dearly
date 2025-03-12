import CreateGroupComponent from "@/design-system/components/groups/create-group";
import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from "react-native";

const CreateGroup = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 mt-[25%]">
        <CreateGroupComponent nextPageNavigate="/(auth)/group/invite" />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default CreateGroup;
