import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/design-system/base/text";
import { Box } from "@/design-system/base/box";
import SettingContent from "@/design-system/components/shared/settings/setting";

const GroupSettings = () => {
  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <Box
        width="100%"
        paddingTop="xl"
        paddingHorizontal="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Text variant="bodyLargeBold">Settings</Text>
        <Box paddingTop="s" width="100%">
          <SettingContent close={() => {}} />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default GroupSettings;
