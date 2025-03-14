import { Box } from "@/design-system/base/box";
import { TextButton } from "./buttons/text-button";
import { Icon } from "./icons/icon";
import { router } from "expo-router";

const SettingContent = () => {
  return (
    <Box gap="s" flexDirection="column">
      <TextButton
        textVariant="bodyLargeBold"
        onPress={() => null}
        label="Edit Profile"
        variant="text"
      />
      <TextButton
        textVariant="bodyLargeBold"
        onPress={() => router.push("/(app)/notification/config")}
        label="Notifications"
        variant="text"
      />
      <TextButton
        textVariant="bodyLargeBold"
        onPress={() => null}
        label="View Group"
        variant="text"
      />
      <Box alignItems="center" flexDirection="row" gap="xs">
        <TextButton
          colorVariant="error"
          textVariant="bodyLargeBold"
          onPress={() => router.push("/(app)/logout")}
          label="Logout"
          variant="text"
        />
        <Icon color="error" name="logout" />
      </Box>
    </Box>
  );
};

export default SettingContent;
