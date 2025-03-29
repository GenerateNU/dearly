import { Box } from "@/design-system/base/box";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import { Text } from "@/design-system/base/text";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";
import { BaseButton } from "@/design-system/base/button";
import { UPDATE_PHOTO_FORM } from "@/utilities/form-schema";
import { router } from "expo-router";
import { getPhotoBlobs } from "@/utilities/media";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import Input from "@/design-system/components/shared/controls/input";
import { useUserStore } from "@/auth/store";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/user";
import { usePatchUser, useUploadUserMedia } from "@/hooks/api/user";
import { UpdateUserPayload } from "@/types/user";
import { Avatar } from "@/design-system/components/shared/avatar";

type UpdatePhotoData = z.infer<typeof UPDATE_PHOTO_FORM>;

const PostCreationForm = () => {
  const {
    handleSubmit,
    trigger,
    setValue: setFormValue,
    getValues,
    watch,
  } = useForm<UpdatePhotoData>({
    mode: "onChange",
    defaultValues: {
      profilePhoto: "",
    },
  });

  const watchPhotos = watch("profilePhoto");

  const {
    mutateAsync: uploadMedia,
    isPending: isPendingMedia,
    error: mediaError,
  } = useUploadUserMedia(getValues("profilePhoto"));

  const {
    mutateAsync: patchUser,
    isPending: isPendingCreatePost,
    error: createPostError,
  } = usePatchUser();

  const onSubmit = async (form: UpdatePhotoData) => {
    try {
      const data = UPDATE_PHOTO_FORM.parse(form);
      const formData = await getPhotoBlobs([data.profilePhoto]);
      const media = await uploadMedia(formData);

      await patchUser({
        profilePhoto: media.objectKey,
      });

      if (!mediaError || !createPostError) {
        router.push("/(app)/(tabs)/profile");
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 4],
      quality: 1,
      allowsMultipleSelection: false,
      selectionLimit: 1,
      orderedSelection: true,
    });

    if (result.canceled) {
      return;
    }

    console.log("result", result);
    console.log("result", result!.assets[0]!.uri);

    setFormValue("profilePhoto", result!.assets[0]!.uri);
    trigger("profilePhoto");
  };

  const { userId } = useUserStore();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["api", "v1", "users", userId],
    queryFn: () => getUser(userId!),
  });

  return (
    <ScrollView>
      <Box
        flex={1}
        gap="xxl"
        padding="m"
        paddingTop="xxl"
        width="100%"
        alignItems="center"
        justifyContent="space-between"
        y-space-20
      >
        <Box paddingTop="xxl" gap="xl" width="100%" alignItems="center" justifyContent="center">
          <Box
            width="100%"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap="m"
          >
            <Box alignItems="center" justifyContent="center">
              <Avatar profilePhoto={watchPhotos} variant="huge" />
            </Box>
            <Box width="25%">
              <TextButton onPress={pickImage} label="Edit" variant="primary" />
            </Box>
          </Box>
          <Box gap="s" width="100%">
            <BaseButton
              variant="text"
              onPress={() => {
                router.push("/(app)/edit-profile/edit-sections/name");
              }}
            >
              <Input
                title="Name"
                onPress={() => {
                  router.push("/(app)/edit-profile/edit-sections/name");
                }}
                isButton={true}
                value={data?.name}
                placeholder={data ? data.name : "Name..."}
              />
            </BaseButton>
            <BaseButton
              variant="text"
              onPress={() => {
                router.push("/(app)/edit-profile/edit-sections/username");
              }}
            >
              <Input
                title="Username"
                onPress={() => {
                  router.push("/(app)/edit-profile/edit-sections/username");
                }}
                isButton={true}
                value={data?.username}
                placeholder={data ? data.username : "Username..."}
              />
            </BaseButton>
            <BaseButton
              variant="text"
              onPress={() => {
                router.push("/(app)/edit-profile/edit-sections/bio");
              }}
            >
              <Input
                title="Bio"
                paragraph={true}
                onPress={() => {
                  router.push("/(app)/edit-profile/edit-sections/bio");
                }}
                isButton={true}
                value={data?.bio ? data?.bio : undefined}
                placeholder={data ? data.bio! : "Bio..."}
              />
            </BaseButton>
            <BaseButton
              variant="text"
              onPress={() => {
                router.push("/(app)/edit-profile/edit-sections/birthday");
              }}
            >
              <Input
                title="Birthday"
                onPress={() => {
                  router.push("/(app)/edit-profile/edit-sections/birthday");
                }}
                isButton={true}
                value={data?.birthday ? data?.birthday : undefined}
                placeholder={data ? data.birthday! : "MM/DD/YYYY"}
              />
            </BaseButton>
          </Box>
        </Box>
        <Box width="100%">
          {mediaError && (
            <Text variant="caption" color="error">
              {mediaError.message}
            </Text>
          )}
          {createPostError && (
            <Text variant="caption" color="error">
              {createPostError.message}
            </Text>
          )}
        </Box>
        <Box alignItems="center" width="100%">
          <TextButton
            disabled={watchPhotos.length === 0 || isPendingMedia || isPendingCreatePost}
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            label="Save"
          />
        </Box>
      </Box>
    </ScrollView>
  );
};

export default PostCreationForm;
