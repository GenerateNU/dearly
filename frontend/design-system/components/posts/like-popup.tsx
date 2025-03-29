import React, { forwardRef, useState, useEffect } from "react";
import { Box } from "@/design-system/base/box";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import BottomSheetModal from "../shared/bottom-sheet";
import { Text } from "@/design-system/base/text";
import { LikeCard } from "./like-card";
import { SearchedUser } from "@/types/user";
import { useGetAllLikeUsers } from "@/hooks/api/like";
import { LikeSkeleton } from "./like-skeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceView from "../utilities/resource-view";
import Spinner from "../shared/spinner";
import ErrorDisplay from "../shared/states/error";
import { EmptyLikesDisplay } from "./empty-likes";

export const LikePopup = forwardRef<BottomSheetMethods, { postId: string }>((props, ref) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const snapPoints = isEmpty ? ["40%"] : ["60%"];

  return (
    <BottomSheetModal ref={ref} snapPoints={snapPoints}>
      {props.postId ? (
        <LikePopUpData postId={props.postId} onEmptyChange={(empty) => setIsEmpty(empty)} />
      ) : (
        <></>
      )}
    </BottomSheetModal>
  );
});

interface LikePopUpDataProps {
  postId: string;
  onEmptyChange: (isEmpty: boolean) => void;
}

const LikePopUpData: React.FC<LikePopUpDataProps> = ({ postId, onEmptyChange }) => {
  const {
    data: likeData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useGetAllLikeUsers(postId);

  const likes = likeData?.pages.flatMap((page) => page) || [];

  useEffect(() => {
    if (!isLoading && likeData) {
      onEmptyChange(likes.length === 0);
    }
  }, [isLoading, likeData, onEmptyChange]);

  const likeResources = {
    data: likes,
    loading: isLoading,
    error: error ? error.message : null,
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <Box padding="m" alignItems="center">
        <LikeSkeleton />
      </Box>
    );
  };

  const renderItem = ({ item }: { item: SearchedUser }) => (
    <LikeCard
      name={item.name ?? ""}
      profilePhoto={item.profilePhoto ?? null}
      username={item.username ?? ""}
      id={item.id ?? ""}
    />
  );

  const SuccessComponent = () => {
    return (
      <Box position="relative" paddingHorizontal="m" height={"100%"} width={"100%"}>
        <Box flexDirection="column" gap="s">
          <Box flexDirection="row" gap="s" alignItems="center">
            <Text variant="bodyLargeBold">
              {likes.length === 1 ? "1 like" : `${likes.length} likes`}
            </Text>
          </Box>
          <Box borderRadius="xl" backgroundColor="slate" height={1}></Box>
        </Box>
        {likes.length !== 0 ? (
          <BottomSheetFlatList
            data={likes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id ?? ""}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{
              paddingTop: 5,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        ) : (
          <EmptyLikesDisplay />
        )}
      </Box>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <ResourceView
        resourceState={likeResources}
        loadingComponent={<Spinner />}
        errorComponent={<ErrorDisplay refresh={refetch} />}
        emptyComponent={<EmptyLikesDisplay />}
        successComponent={<SuccessComponent />}
      />
    </SafeAreaView>
  );
};

LikePopup.displayName = "LikePopup";
