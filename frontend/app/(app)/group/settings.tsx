import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/design-system/base/text";
import { Box } from "@/design-system/base/box";
import GroupOptionContent from "@/design-system/components/shared/settings/options";
import { useIsBasicMode } from "@/hooks/component/mode";

const GroupSettings = () => {
  const isBasic = useIsBasicMode();

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
        <Text variant={isBasic ? "h2" : "bodyLargeBold"}>Settings</Text>
        <Box paddingTop="s" width="100%">
          <GroupOptionContent />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default GroupSettings;
