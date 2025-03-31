import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import RedTextButton from "../buttons/red-text-button";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useIsBasicMode } from "@/hooks/component/mode";
import Arrow from "@/assets/arrow.svg";

interface CloseModalProps {
  close: () => void;
}

type AppRoute =
  | "/(app)/group/add-member"
  | "/(app)/group/delete"
  | "/(app)/group/leave"
  | "/(app)/group/change-name"
  | "/(app)/group/set-nudge";

const GroupOptionContent: React.FC<CloseModalProps> = ({ close }) => {
  const { group, userId } = useUserStore();
  const isBasic = useIsBasicMode();

  if (!group) return null;

  const isManager = userId === group.managerId;

  const handleNavigation = (path: AppRoute) => {
    close();
    router.push(path);
  };

  const Button = ({ route, label }: { route: AppRoute; label: string }) => {
    return (
      <TouchableOpacity
        style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row" }}
        onPress={() => handleNavigation(route)}
      >
        <Text variant="bodyLargeBold">{label}</Text>
        {isBasic && <Arrow />}
      </TouchableOpacity>
    );
  };

  return (
    <Box gap="s" flexDirection="column">
      <Text color="darkGray" variant="caption">
        More Options
      </Text>
      {isManager ? (
        <Box gap="s">
          <Button route="/(app)/group/change-name" label="Change Group Name" />
          <Button route="/(app)/group/add-member" label="Add New Member" />
          <Button route="/(app)/group/set-nudge" label="Set Recurring Nudge" />
          <RedTextButton
            onPress={() => handleNavigation("/(app)/group/delete")}
            label="Delete Group"
            icon="trash-can-outline"
          />
        </Box>
      ) : (
        <RedTextButton
          onPress={() => handleNavigation("/(app)/group/leave")}
          label="Leave Group"
          icon="logout"
        />
      )}
    </Box>
  );
};

export default GroupOptionContent;
