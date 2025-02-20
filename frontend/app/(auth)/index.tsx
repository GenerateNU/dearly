import { Box } from "@/design-system/base/box";
import { router } from "expo-router";
import { TextButton } from "@/design-system/components/ui/text-button";
import { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { CommentPopUp } from "@/design-system/components/comments/bottom-sheet";

const Index = () => {
  const sheetRef = useRef<BottomSheet>(null);

  return (
    <Box backgroundColor="pearl" gap="m" flex={1} justifyContent="center" alignItems="center">
      <Box gap="s" width="50%">
        <TextButton
          variant="honeyRounded"
          label="Login"
          onPress={() => router.push("/(auth)/login")}
        />
        <TextButton
          variant="honeyRounded"
          label="Register"
          onPress={() => router.push("/(auth)/register")}
        />
        <TextButton
          variant="honeyRounded"
          label="Components"
          onPress={() => router.push("/(auth)/demo")}
        />
        <TextButton
          variant="honeyRounded"
          onPress={() => sheetRef.current?.snapToIndex(0)}
          label="Popup"
        />
      </Box>
      <CommentPopUp id="" ref={sheetRef} />
    </Box>
  );
};

export default Index;
