import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
} from "react-native";
import PostCreationForm from "./components/create-post-form";
import { useUserGroups } from "@/hooks/api/user";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyHomePage } from "@/design-system/components/home/empty";

const CreatePost = () => {
  const data = [{ key: "form" }];
  const { data: groupsData, isLoading, error, fetchNextPage, isFetchingNextPage } = useUserGroups();

  const formattedGroups = useMemo(() => {
    if (!groupsData) return [];

    return groupsData.pages.flat().map((group) => ({
      label: group.name,
      value: group.id,
    }));
  }, [groupsData]);

  const hasGroups = formattedGroups.length > 0;

  if (!hasGroups && !isLoading) {
    return (
      <Box
        padding="m"
        gap="xl"
        alignItems="center"
        justifyContent="center"
        backgroundColor="pearl"
        flex={1}
      >
        <EmptyHomePage />
      </Box>
    );
  }

  const renderItem = () => (
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
        {error ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Text variant="caption" color="error">
              Failed to load groups. Please try again later.
            </Text>
          </Box>
        ) : (
          <PostCreationForm
            onEndReached={() => {
              if (!isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            groups={formattedGroups}
            isLoading={isLoading || isFetchingNextPage}
          />
        )}
      </Box>
    </TouchableWithoutFeedback>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView edges={["top"]} collapsable={false} className="flex-1 mt-[10%]">
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CreatePost;
