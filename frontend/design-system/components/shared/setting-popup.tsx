import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { forwardRef } from "react";
import BottomSheetModal from "./bottom-sheet";
import { Box } from "@/design-system/base/box";
import SettingContent from "./setting";

const SettingPopup = forwardRef<BottomSheetMethods, object>((_, ref) => {
  return (
    <BottomSheetModal snapPoints={["40%"]} ref={ref}>
      <Box margin="l">
        <SettingContent />
      </Box>
    </BottomSheetModal>
  );
});

SettingPopup.displayName = "SettingPopup";
export default SettingPopup;
