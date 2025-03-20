import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { forwardRef, useImperativeHandle, useRef } from "react";
import BottomSheetModal from "../bottom-sheet";
import { Box } from "@/design-system/base/box";
import { useUserStore } from "@/auth/store";
import GroupOptionContent from "./options";

const OptionsPopup = forwardRef<BottomSheetMethods, object>((_, ref) => {
  const { group, userId } = useUserStore();
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  useImperativeHandle(ref, () => ({
    close: () => bottomSheetRef.current?.close(),
    snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    snapToPosition: (position: string | number, animationConfigs?: any) =>
      bottomSheetRef.current?.snapToPosition(position, animationConfigs),
    expand: () => bottomSheetRef.current?.expand(),
    collapse: () => bottomSheetRef.current?.collapse(),
    forceClose: () => bottomSheetRef.current?.forceClose(),
  }));

  if (!group) return null;

  const isManager = userId === group.managerId;

  return (
    <BottomSheetModal snapPoints={isManager ? ["40%"] : ["30%"]} ref={bottomSheetRef}>
      <Box margin="l">
        <GroupOptionContent close={() => bottomSheetRef.current?.close()} />
      </Box>
    </BottomSheetModal>
  );
});

OptionsPopup.displayName = "OptionsPopup";
export default OptionsPopup;
