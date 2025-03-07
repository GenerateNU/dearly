import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Avatar } from "@/design-system/components/ui/avatar";
import { SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import * as ImagePicker from "expo-image-picker";
import EditNameForm from "./components/edit-name-form";

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
            <TouchableOpacity activeOpacity={0.7} onPress={pickImage}>
              <Box alignItems="center" justifyContent="center">
                <Avatar profilePhoto={user.profilePhoto} variant="huge" />
                <Box position="absolute">
                  <Text>Edit</Text>
                </Box>
              </Box>
            </TouchableOpacity>
          </Box>
          <EditNameForm />
        </Box>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default EditProfile;
