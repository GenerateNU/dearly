import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { forwardRef } from "react";
import BottomSheetModal from "../bottom-sheet";
import { Box } from "@/design-system/base/box";
import SettingContent from "./setting";

// First, define a proper props interface
interface SettingPopupProps {
  close: () => void;
}

// Update the forwardRef type to include your props
const SettingPopup = forwardRef<BottomSheetMethods, SettingPopupProps>((props, ref) => {
  const { close } = props;
  return (
    <BottomSheetModal snapPoints={["40%"]} ref={ref}>
      <Box margin="l">
        <SettingContent close={close} />
      </Box>
    </BottomSheetModal>
  );
});

SettingPopup.displayName = "SettingPopup";
export default SettingPopup;
