import { Box } from "@/design-system/base/box";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";
import RedTextButton from "../buttons/red-text-button";
import { useIsBasicMode } from "@/hooks/component/mode";
import { PageButton } from "../buttons/page-button";

interface SettingContentProps {
  close?: () => void;
}

const SettingContent = ({ close }: SettingContentProps) => {
  const { group } = useUserStore();
  const isBasic = useIsBasicMode();

  return (
    <Box gap="s" flexDirection="column">
      {group && (
        <Box gap="s">
          <PageButton
            onPress={() => {
              if (close) close();
              router.push("/(app)/edit-profile");
            }}
            label="Edit Profile"
          />
          <PageButton
            textVariant="bodyLargeBold"
            onPress={() => {
              if (close) close();
              router.push("/(app)/notification/config");
            }}
            label="Notifications"
          />
          <PageButton
            textVariant="bodyLargeBold"
            onPress={() => router.push("/(app)/user/mode")}
            label={`Switch to ${isBasic ? "Advanced" : "Basic"}`}
          />
          <PageButton
            textVariant="bodyLargeBold"
            onPress={() => {
              if (close) close();
              router.push("/(app)/group/member");
            }}
            label="View Group"
          />
        </Box>
      )}
      <RedTextButton onPress={() => router.push("/(app)/logout")} label="Logout" icon="logout" />
    </Box>
  );
};

export default SettingContent;
