import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { useUserStore } from "@/auth/store";
import { Text } from "@/design-system/base/text";
import RedTextButton from "../buttons/red-text-button";
import { router } from "expo-router";

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

  if (!group) return null;

  const isManager = userId === group.managerId;

  const handleNavigation = (path: AppRoute) => {
    close();
    router.push(path);
  };

  return (
    <Box gap="s" flexDirection="column">
      <Text color="darkGray" variant="caption">
        More Options
      </Text>
      {isManager ? (
        <Box gap="s">
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => handleNavigation("/(app)/group/change-name")}
            label="Change Group Name"
            variant="text"
          />
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => handleNavigation("/(app)/group/add-member")}
            label="Add New Member"
            variant="text"
          />
          <TextButton
            textVariant="bodyLargeBold"
            onPress={() => handleNavigation("/(app)/group/set-nudge")}
            label="Set Recurring Nudge"
            variant="text"
          />
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
