import React, { forwardRef, useCallback } from "react";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

interface BottomSheetModalProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number;
  onClose?: () => void;
  scrollEnabled?: boolean;
}

type Ref = BottomSheetMethods;

const BottomSheetModal = forwardRef<Ref, BottomSheetModalProps>(
  ({ children, snapPoints = ["50%", "95%"], initialIndex = -1, onClose }, ref) => {
    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
      [],
    );

    return (
      <BottomSheet
        ref={ref}
        index={initialIndex}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        enableOverDrag
        enablePanDownToClose
        enableHandlePanningGesture
        onClose={onClose}
        style={{
          flex: 1,
        }}
      >
        {children}
      </BottomSheet>
    );
  },
);

BottomSheetModal.displayName = "BottomSheetModal";

export default BottomSheetModal;
