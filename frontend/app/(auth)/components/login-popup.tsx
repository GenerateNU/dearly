import { Box } from "@/design-system/base/box";
import LoginForm from "./login-form";
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from "react-native";
import BottomSheetModal from "@/design-system/components/ui/bottom-sheet";
import { forwardRef, useEffect, RefObject } from "react";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useOnboarding } from "@/contexts/onboarding";
import { useBottomSheetInternal } from "@gorhom/bottom-sheet";

interface LoginModalProps {
  onClose?: () => void;
}

const LoginModal = forwardRef<BottomSheetMethods, LoginModalProps>(({ onClose }, ref) => {
  const { page, popupVisible } = useOnboarding();

  useEffect(() => {
    if (page === 0 && popupVisible) {
      const refObject = ref as RefObject<BottomSheetMethods>;

      const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
        if (refObject?.current && popupVisible) {
          refObject.current.snapToIndex(1);
        }
      });

      const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
        if (refObject.current && popupVisible && page === 0) {
          refObject.current.snapToIndex(0);
        }
      });

      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }
  }, [page, popupVisible]);

  return (
    <BottomSheetModal snapPoints={["55%", "90%"]} ref={ref} onClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Box
            className="w-full"
            justifyContent="flex-start"
            alignItems="flex-start"
            paddingHorizontal="l"
            paddingTop="s"
          >
            <LoginForm />
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
});

LoginModal.displayName = "LoginPopUp";
export default LoginModal;
