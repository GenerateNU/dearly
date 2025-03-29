import logout from "@/app/(app)/logout";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { SafeAreaView, TextInput } from "react-native";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { useState } from "react";

export default function Layout() {
  const [text, setText] = useState("");
  return (
    <Box width="100%" paddingTop="xxl" padding="m" flex={1} gap="l" alignItems="center">
      <Box paddingTop="xxl" width="100%" gap="s">
        <Text variant="body">Name</Text>
      </Box>
      <TextInput
        className="border border-black-300 p-2 h-12 w-full rounded-lg"
        placeholder="Bio..."
        placeholderTextColor="#999"
        value={text}
        onChangeText={setText}

      />
      <TextButton
        onPress={() => router.push("/(app)/edit-profile")}
        label="Save"
        variant="primary"
      />
    </Box>
  );
}
 