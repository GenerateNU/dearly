import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/design-system/base/text";
import { Box } from "@/design-system/base/box";
import SelectGroup from "@/design-system/components/shared/switch-group/select-group";

const SwitchGroup = () => {
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
        <Text variant="bodyLargeBold">Switch Group</Text>
        <Box paddingTop="xs" width="100%">
          <SelectGroup />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default SwitchGroup;
