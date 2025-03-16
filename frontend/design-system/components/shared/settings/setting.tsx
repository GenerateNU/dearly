import { Box } from "@/design-system/base/box";
import { router } from "expo-router";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { useUserStore } from "@/auth/store";

const SettingContent = () => {
  const { group } = useUserStore();

  // TODO: add routing for the setting menu
  return (
    <Box gap="s" flexDirection="column">
      {group && (
        <Box gap="s">
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
        </Box>
      )}
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
