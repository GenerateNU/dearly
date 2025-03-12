import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import PostCreationForm from "./components/create-post-form";
import { useUserGroups } from "@/hooks/api/user";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceView from "@/design-system/components/utilities/resource-view";
import ErrorDisplay from "@/design-system/components/shared/states/error";
import EmptyDataDisplay from "@/design-system/components/shared/states/empty";
import Spinner from "@/design-system/components/shared/spinner";

const CreatePost = () => {
  const data = [{ key: "form" }];
  const {
    data: groupsData,
    isLoading,
    error,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useUserGroups();

  const formattedGroups = useMemo(() => {
    if (!groupsData) return [];

    return groupsData.pages.flat().map((group) => ({
      label: group.name,
      value: group.id,
    }));
  }, [groupsData]);

  const onEndReached = () => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const groupState = {
    data: formattedGroups,
    loading: isLoading || isFetchingNextPage,
    error: error ? error.message : null,
  };

  const ErrorComponent = (
    <Box className="mt-[30%]" padding="m" alignItems="center" justifyContent="center" flex={1}>
      <ErrorDisplay refresh={refetch} />
    </Box>
  );

  const LoadingComponent = (
    <Box className="mt-[80%]" flex={1} justifyContent="center" alignItems="center">
      <Spinner />
    </Box>
  );

  const EmptyComponent = (
    <Box className="mt-[40%]" padding="m" flex={1} height="100%">
      <EmptyDataDisplay />
    </Box>
  );

  const SuccessComponent = (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Box
        gap="m"
        paddingTop="s"
        padding="m"
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Text variant="bodyLargeBold">Upload Photo</Text>
        <PostCreationForm
          onEndReached={onEndReached}
          groups={formattedGroups}
          isLoading={isLoading || isFetchingNextPage}
        />
      </Box>
    </TouchableWithoutFeedback>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView
        edges={groupState.error ? ["top", "bottom", "left", "right"] : ["top"]}
        className="flex-1 mt-[10%] justify-center"
      >
        <FlatList
          data={data}
          renderItem={() => (
            <ResourceView
              resourceState={groupState}
              successComponent={SuccessComponent}
              loadingComponent={LoadingComponent}
              errorComponent={ErrorComponent}
              emptyComponent={EmptyComponent}
              doNotShowLoadingIfDataAvailable={true}
            />
          )}
          keyExtractor={(item) => item.key}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CreatePost;
