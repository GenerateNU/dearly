import { Box } from "@/design-system/base/box";
import { Dropdown } from "@/design-system/components/ui/dropdown";
import { Icon } from "@/design-system/components/ui/icon";
import Input from "@/design-system/components/ui/input";
import { TextButton } from "@/design-system/components/ui/text-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import { Text } from "@/design-system/base/text";
import { Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FlatList } from "react-native-gesture-handler";
import { DropdownItem } from "@/types/dropdown";
import { CREATE_POST_SCHEMA } from "@/utilities/form-schema";
import SelectedPhoto from "./photo";
import ImagePlaceholder from "./photo-placeholder";
import { useUploadGroupMedia } from "@/hooks/api/media";
import { useCreatePost } from "@/hooks/api/post";
import { router } from "expo-router";
import { getPhotoBlobs } from "@/utilities/media";
import { CreatePostPayload } from "@/types/post";

const PHOTO_DIMENSION = 200;
type CreatePostData = z.infer<typeof CREATE_POST_SCHEMA>;

interface PostCreationFormProps {
  groups: DropdownItem[];
  isLoading: boolean;
  onEndReached: () => void;
}

const PostCreationForm = ({ groups, isLoading, onEndReached }: PostCreationFormProps) => {
  const {
    control,
    handleSubmit,
    trigger,
    setValue: setFormValue,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm<CreatePostData>({
    resolver: zodResolver(CREATE_POST_SCHEMA),
    mode: "onChange",
    defaultValues: {
      photos: [],
      group: "",
    },
  });

  const watchPhotos = watch("photos");
  const watchGroup = watch("group");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleGroupUpdate = (value: SetStateAction<string | null>) => {
    setSelectedGroup(value);
    if (typeof value === "string") {
      setFormValue("group", value);
      trigger("group");
    } else if (typeof value === "function") {
      const newValue = value(selectedGroup);
      if (newValue) {
        setFormValue("group", newValue);
        trigger("group");
      } else {
        setFormValue("group", "");
        trigger("group");
      }
    }
  };

  const {
    mutateAsync: uploadMedia,
    isPending: isPendingMedia,
    error: mediaError,
  } = useUploadGroupMedia(getValues("group"));

  const {
    mutateAsync: createPost,
    isPending: isPendingCreatePost,
    error: createPostError,
  } = useCreatePost(getValues("group"));

  const onSubmit = async (form: CreatePostData) => {
    try {
      const data = CREATE_POST_SCHEMA.parse(form);
      const formData = await getPhotoBlobs(data.photos);
      const keys = await uploadMedia(formData);

      await createPost({
        media: keys as CreatePostPayload["media"],
        caption: data.caption,
        location: data.location,
      });
      if (!mediaError || !createPostError) {
        router.push("/(app)/(tabs)");
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      }
    }
  };

  const pickImage = async () => {
    const currentPhotos = getValues("photos") || [];
    if (currentPhotos.length >= 3) {
      Alert.alert(
        "Maximum Photos Reached",
        "You've already selected 3 photos. Please remove at least one photo before adding more.",
        [{ text: "OK" }],
      );
      return;
    }

    const remainingSlots = 3 - currentPhotos.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 4],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      orderedSelection: true,
    });

    if (result.canceled) {
      return;
    }

    if (result.assets) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      const combinedPhotos = [...currentPhotos, ...newPhotos].slice(0, 3);
      setFormValue("photos", combinedPhotos);
      trigger("photos");
    }
  };

  const removePhoto = (indexToRemove: number) => {
    const currentPhotos = getValues("photos") || [];
    const updatedPhotos = currentPhotos.filter((_, index) => index !== indexToRemove);
    setFormValue("photos", updatedPhotos);
    trigger("photos");
  };

  const renderPhotoItem = ({ item, index }: { item: string; index: number }) => (
    <SelectedPhoto
      uri={item}
      dimension={PHOTO_DIMENSION}
      index={index}
      onRemove={() => removePhoto(index)}
    />
  );

  return (
    <Box flex={1} gap="m" width="100%" alignItems="center" justifyContent="space-between">
      <Box gap="xl" width="100%" alignItems="center" justifyContent="center">
        {!watchPhotos || watchPhotos.length === 0 ? (
          <Pressable onPress={pickImage}>
            <ImagePlaceholder dimension={PHOTO_DIMENSION} />
          </Pressable>
        ) : (
          <Box width="100%">
            <FlatList
              data={watchPhotos}
              renderItem={renderPhotoItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: "20%" }}
            />
          </Box>
        )}
        <Box gap="s" width="100%">
          <TextButton
            onPress={pickImage}
            variant="blushRounded"
            label={
              watchPhotos?.length > 0 ? `Add more photos (${watchPhotos.length}/3)` : "Add photos"
            }
          />
          {errors.photos && (
            <Text color="error" variant="caption" textAlign="left">
              {errors.photos.message}
            </Text>
          )}
          <Controller
            name="caption"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChangeText={(text: string) => {
                  onChange(text);
                  trigger("caption");
                }}
                paragraph
                value={value}
                placeholder="Add a caption"
                error={errors.caption && errors.caption.message}
              />
            )}
          />
          <Controller
            name="group"
            control={control}
            render={() => (
              <Box>
                <Dropdown
                  value={selectedGroup}
                  setValue={handleGroupUpdate}
                  items={groups}
                  setItems={() => {}}
                  isLoading={isLoading}
                  onEndReached={onEndReached}
                />
                {errors.group && (
                  <Text color="error" variant="caption" textAlign="left">
                    {errors.group.message}
                  </Text>
                )}
              </Box>
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChangeText={(text: string) => {
                  onChange(text);
                  trigger("location");
                }}
                leftIcon={<Icon name="map-marker-outline" />}
                value={value}
                placeholder="Add a location"
                error={errors.location && errors.location.message}
              />
            )}
          />
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
          disabled={
            !isValid ||
            !watchGroup ||
            watchPhotos.length === 0 ||
            isPendingMedia ||
            isPendingCreatePost
          }
          variant="honeyRounded"
          onPress={handleSubmit(onSubmit)}
          label="Post"
        />
      </Box>
    </Box>
  );
};

export default PostCreationForm;
