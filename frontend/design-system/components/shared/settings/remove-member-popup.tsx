import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { forwardRef } from "react";
import BottomSheetModal from "../bottom-sheet";
import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import { useRemoveMemberContext } from "@/contexts/remove-member";
import { Text } from "@/design-system/base/text";
import RedTextButton from "../buttons/red-text-button";
import { router } from "expo-router";

const RemoveMemberPopUp = forwardRef<BottomSheetMethods, object>((_, ref) => {
  const { group } = useUserStore();
  const { user } = useRemoveMemberContext();

  if (!group || !user) return;

  return (
    <BottomSheetModal snapPoints={["25%"]} ref={ref}>
      <Box margin="l">
        <Text variant="caption">@{user.username}</Text>
        <RedTextButton
          onPress={() => router.push("/(app)/group/remove")}
          label="Remove From Group"
          icon="trash-can-outline"
        />
      </Box>
    </BottomSheetModal>
  );
});

RemoveMemberPopUp.displayName = "RemoveMemberPopUp";
export default RemoveMemberPopUp;
