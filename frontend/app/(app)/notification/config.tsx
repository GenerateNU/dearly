import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import Toggle from "@/design-system/components/shared/toggle";
import { useState } from "react";
import { SafeAreaView } from "react-native";

const NotificationConfig = () => {
  const [enabled, setEnabled] = useState(true);

  return (
    <SafeAreaView className="flex-1">
      <Box
        width="100%"
        paddingHorizontal="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Text variant="h2">Notifications</Text>
        <Toggle isLoading={true} enabled={enabled} onToggle={() => setEnabled(!enabled)} />
      </Box>
    </SafeAreaView>
  );
};

export default NotificationConfig;
