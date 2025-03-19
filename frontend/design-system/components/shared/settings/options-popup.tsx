import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { forwardRef } from "react";
import BottomSheetModal from "../bottom-sheet";
import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import GroupOptionContent from "./options";

const OptionsPopup = forwardRef<BottomSheetMethods, object>((_, ref) => {
  const { group, userId } = useUserStore();

  if (!group) return;

  const isManager = userId === group.managerId;

  return (
    <BottomSheetModal snapPoints={isManager ? ["40%"] : ["30%"]} ref={ref}>
      <Box margin="l">
        <GroupOptionContent />
      </Box>
    </BottomSheetModal>
  );
});

OptionsPopup.displayName = "OptionsPopup";
export default OptionsPopup;
