import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { PostCreationForm } from "./components/create-post-form";

const CreatePost = () => {
  // Create a simple data array with a single item for FlatList
  const data = [{ key: "form" }];

  // Render item function for FlatList
  const renderItem = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Box
        gap="m"
        paddingTop="s"
        padding="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Text variant="bodyLargeBold">Upload Photo</Text>
        <PostCreationForm />
      </Box>
    </TouchableWithoutFeedback>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView collapsable={false} className="flex-1">
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CreatePost;
