import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { SafeAreaView } from "react-native";

const CreatePost = () => {
  return (
    <SafeAreaView className="flex-1">
      <Box paddingTop="s" padding="m" flex={1} justifyContent="flex-start" alignItems="flex-start">
        <Text variant="bodyLargeBold">Upload Photo</Text>
      </Box>
    </SafeAreaView>
  );
};

export default CreatePost;
