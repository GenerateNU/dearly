import { forwardRef } from "react";
import BottomSheetModal from "../bottom-sheet";
import SelectGroup from "./select-group";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { Box } from "@/design-system/base/box";

const SwitchGroupBottomSheet = forwardRef<BottomSheetMethods, object>((_, ref) => {
  return (
    <BottomSheetModal ref={ref}>
      <Box margin="m">
        <SelectGroup />
      </Box>
    </BottomSheetModal>
  );
});

SwitchGroupBottomSheet.displayName = "SwitchGroupBottomSheet";
export default SwitchGroupBottomSheet;
