import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Avatar } from "@/design-system/components/ui/avatar";
import { SafeAreaView, TouchableWithoutFeedback, Keyboard } from "react-native";
import * as ImagePicker from "expo-image-picker";
import EditNameForm from "./components/edit-name-form";
import { TextButton } from "@/design-system/components/ui/text-button";

const EditProfile = () => {
  const { user, setUser } = useOnboarding();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    if (result.assets[0]) {
      setUser({ profilePhoto: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView className="flex-1 mt-[25%]">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Box
          flex={1}
          paddingBottom="l"
          padding="m"
          justifyContent="space-between"
          flexDirection="column"
          gap="m"
        >
          <Box gap="s" className="w-full" justifyContent="center" alignItems="center">
            <Text variant="bodyLargeBold">Profile</Text>
            <Box
              width="100%"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              gap="m"
            >
              <Box alignItems="center" justifyContent="center">
                <Avatar profilePhoto={user.profilePhoto} variant="huge" />
              </Box>
              <Box width="25%">
                <TextButton onPress={pickImage} label="Edit" variant="honeyRounded" />
              </Box>
            </Box>
          </Box>
          <EditNameForm />
        </Box>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default EditProfile;
