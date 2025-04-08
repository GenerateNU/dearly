import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import SettingContent from "@/design-system/components/shared/settings/setting";
import { useIsBasicMode } from "@/hooks/component/mode";
import { SafeAreaView } from "react-native-safe-area-context";

export const SettingsPage = () => {
  const isBasic = useIsBasicMode();

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <Box
        position="relative"
        paddingHorizontal="m"
        height={"100%"}
        width={"100%"}
        paddingTop="xl"
        flexDirection="column"
        gap="m"
      >
        <Text variant={isBasic ? "h2" : "bodyLargeBold"}>Settings</Text>
        <SettingContent />
      </Box>
    </SafeAreaView>
  );
};

export default SettingsPage;
