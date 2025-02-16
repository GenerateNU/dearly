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
      <TextButton variant="halfHoney" label="Login" onPress={() => router.push("/(auth)/login")} />
      <TextButton
        variant="halfHoney"
        label="Register"
        onPress={() => router.push("/(auth)/register")}
      />
      <TextButton
        variant="halfHoney"
        label="Components"
        onPress={() => router.push("/(auth)/demo")}
      />
      <TextButton
        variant="halfHoney"
        onPress={() => sheetRef.current?.snapToIndex(0)}
        label="Popup"
      />

      <CommentPopUp id="" ref={sheetRef} />
    </Box>
  );
};

export default Index;
