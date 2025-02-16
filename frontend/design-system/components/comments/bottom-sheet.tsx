import React, { forwardRef, useCallback, useMemo } from "react";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { CommentCard } from "./comment";

interface CommentPopUpProps {
  id: string; // postId
}

type Ref = BottomSheet;

export const CommentPopUp = forwardRef<Ref, CommentPopUpProps>(({ id }, ref) => {
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
    >
      <BottomSheetView>
        <Box
          width="100%"
          paddingTop="l"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          gap="s"
        >
          <Text paddingBottom="s" variant="body">
            Welcome to Dearly 💛
          </Text>
          <Box width="100%" paddingHorizontal="m">
            <CommentCard
              id=""
              userId=""
              postId=""
              voiceMemo=""
              content="connect with your loved ones in a meaningful way 💬"
              createdAt={new Date().toISOString()}
              username="quokka"
              profilePhoto="https://avatars.githubusercontent.com/u/123816878?v=4"
            />
          </Box>
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

CommentPopUp.displayName = "CommentPopUp";
