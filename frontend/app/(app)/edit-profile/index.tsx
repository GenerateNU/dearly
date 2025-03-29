import { Box } from "@/design-system/base/box";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import { Text } from "@/design-system/base/text";
import { Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";
import { BaseButton } from "@/design-system/base/button";
import { CREATE_POST_SCHEMA, UPDATE_PHOTO_FORM } from "@/utilities/form-schema";
import ImagePlaceholder from "./photo-placeholder";
import { router } from "expo-router";
import { getPhotoBlobs } from "@/utilities/media";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import Input from "@/design-system/components/shared/controls/input";
import { useUserStore } from "@/auth/store";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/user";
import { usePatchUser, useUploadUserMedia } from "@/hooks/api/user";
import { UpdateUserPayload } from "@/types/user";
import SelectedPhoto from "./photo";
import { Avatar } from "@/design-system/components/shared/avatar";

const PHOTO_DIMENSION = 200;
type UpdatePhotoData = z.infer<typeof UPDATE_PHOTO_FORM>;

const PostCreationForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    setValue: setFormValue,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm<UpdatePhotoData>({
    resolver: zodResolver(CREATE_POST_SCHEMA),
    mode: "onChange",
    defaultValues: {
      profilePhoto: "",
    },
  });

  const watchPhotos = watch("profilePhoto");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

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
      console.log("data", data);
      const formData = await getPhotoBlobs([data.profilePhoto]);
      console.log("formdata", formData);
      const keys = await uploadMedia(formData);
      console.log("data", data);
      console.log("keys", keys);

      await patchUser({
        media: keys as UpdateUserPayload["profilePhoto"],
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
            <Text color="ink" variant="caption" textAlign="left">
              Name
            </Text>
            <BaseButton
              variant="text"
              onPress={() => {
                router.push("/(app)/edit-profile/edit-sections/name");
              }}
            >
              <Controller
                name="profilePhoto"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    onPress={() => {
                      router.push("/(app)/edit-profile/edit-sections/name");
                    }}
                    isButton={true}
                    onChangeText={(text: string) => {
                      onChange(text);
                      trigger("profilePhoto");
                    }}
                    value={value}
                    placeholder={data ? data.name : "Name..."}
                  />
                )}
              />
            </BaseButton>
            <Text color="ink" variant="caption" textAlign="left">
              Username
            </Text>
            <BaseButton
              variant="text"
              onPress={() => {
                router.push("/(app)/edit-profile/edit-sections/username");
              }}
            >
              <Controller
                name="profilePhoto"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    onPress={() => {
                      router.push("/(app)/edit-profile/edit-sections/username");
                    }}
                    isButton={true}
                    onChangeText={(text: string) => {
                      onChange(text);
                      trigger("profilePhoto");
                    }}
                    value={value}
                    placeholder={data ? data.username : "Username..."}
                  />
                )}
              />
            </BaseButton>
            <Text color="ink" variant="caption" textAlign="left">
              Bio
            </Text>
            <BaseButton
              variant="text"
              onPress={() => {
                router.push("/(app)/edit-profile/edit-sections/bio");
              }}
            >
              <Controller
                name="profilePhoto"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    paragraph={true}
                    onPress={() => {
                      router.push("/(app)/edit-profile/edit-sections/bio");
                    }}
                    isButton={true}
                    value={value}
                    placeholder={data ? data.bio! : "Bio..."}
                  />
                )}
              />
            </BaseButton>
            <Text color="ink" variant="caption" textAlign="left">
              Birthday
            </Text>
            <BaseButton
              variant="text"
              onPress={() => {
                router.push("/(app)/edit-profile/edit-sections/birthday");
              }}
            >
              <Controller
                name="profilePhoto"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    onPress={() => {
                      router.push("/(app)/edit-profile/edit-sections/birthday");
                    }}
                    isButton={true}
                    value={value}
                    placeholder={data ? data.birthday! : "MM/DD/YYYY"}
                  />
                )}
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
            disabled={!isValid || watchPhotos.length === 0 || isPendingMedia || isPendingCreatePost}
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
