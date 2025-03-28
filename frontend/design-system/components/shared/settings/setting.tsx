import { Box } from "@/design-system/base/box";
import { router } from "expo-router";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useUserStore } from "@/auth/store";
import RedTextButton from "../buttons/red-text-button";
import { useIsBasicMode } from "@/hooks/component/mode";

const SettingContent = () => {
  const { group } = useUserStore();
  const isBasic = useIsBasicMode();

  return (
    <Box gap="s" flexDirection="column">
      {group && (
        <Box gap="s">
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => null} // TODO: add route here
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
            onPress={() => router.push("/(app)/user/mode")}
            label={`Switch to ${isBasic ? "Advanced" : "Basic"}`}
            variant="text"
          />
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => router.push("/(app)/group/member")}
            label="View Group"
            variant="text"
          />
        </Box>
      )}
      <RedTextButton onPress={() => router.push("/(app)/logout")} label="Logout" icon="logout" />
    </Box>
  );
};

export default SettingContent;
