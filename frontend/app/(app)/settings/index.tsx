import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { PageButton } from "@/design-system/components/shared/buttons/page-button";
import { useIsBasicMode } from "@/hooks/component/mode";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export const SettingsPage = () => {
const isBasic = useIsBasicMode();
  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"} paddingTop="xl" flexDirection="column">
        <Text variant="h1" paddingBottom="m">
          Settings
        </Text>
        <Box borderRadius="xl" backgroundColor="slate" height={1}></Box>

        <PageButton onPress={() => router.navigate("/(app)/edit-profile")} label="Edit Profile" />
        <PageButton onPress={() => router.navigate("/(app)/notification/config")} label="Notifications" />
        <PageButton onPress={() => router.navigate("/(app)/group/member")} label="View Group" />
        <PageButton onPress={() => router.navigate("/(app)/user/mode")} label={`Switch to ${isBasic ? "Advanced" : "Basic"}`} />
      </Box>
    </SafeAreaView>
  );
};

export default SettingsPage;
