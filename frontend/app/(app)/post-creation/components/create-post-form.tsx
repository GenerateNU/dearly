import { Box } from "@/design-system/base/box";
import { Dropdown } from "@/design-system/components/ui/dropdown";
import { Icon } from "@/design-system/components/ui/icon";
import Input from "@/design-system/components/ui/input";
import { TextButton } from "@/design-system/components/ui/text-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, SetStateAction, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Text } from "@/design-system/base/text";
import { Pressable, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FlatList } from "react-native-gesture-handler";
import { DropdownItem } from "@/types/dropdown";
import { Theme } from "@/design-system/base/theme";
import { useTheme } from "@shopify/restyle";

const PHOTO_DIMENSION = 200;
const CREATE_POST_SCHEMA = z.object({
  caption: z
    .string()
    .max(500, {
      message: "Caption must be at most 500 characters",
    })
    .optional(),
  photos: z
    .string()
    .array()
    .min(1, {
      message: "Please select at least 1 photo",
    })
    .max(3, {
      message: "Please select at most three photos",
    }),
  location: z
    .string()
    .max(100, {
      message: "Location must be at most 100 characters long",
    })
    .optional(),
  group: z.string({
    required_error: "Group is required",
  }),
});

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

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      // setSelectedGroup(groups[0].value);
      // setFormValue("group", groups[0].value);
      // trigger("group");
    }
  }, [groups]);

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

  const theme = useTheme<Theme>();

  const onSubmit = (data: CreatePostData) => {
    console.log("Form submitted with:", data);
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
    <Box marginRight="s" position="relative">
      <Image
        source={{ uri: item }}
        style={{
          borderRadius: theme.borderRadii.s,
          height: PHOTO_DIMENSION,
          width: PHOTO_DIMENSION,
        }}
      />
      <Pressable onPress={() => removePhoto(index)} className="top-2 right-2 z-10 absolute">
        <Box
          backgroundColor="pearl"
          borderRadius="full"
          padding="xs"
          shadowColor="ink"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.3}
          shadowRadius={3}
          elevation={3}
        >
          <Icon size={20} name="close" />
        </Box>
      </Pressable>
    </Box>
  );

  return (
    <Box flex={1} gap="m" width="100%" alignItems="center" justifyContent="space-between">
      <Box gap="xl" width="100%" alignItems="center" justifyContent="center">
        {!watchPhotos || watchPhotos.length === 0 ? (
          <Pressable onPress={pickImage}>
            <Box
              borderRadius="s"
              backgroundColor="slate"
              height={PHOTO_DIMENSION}
              width={PHOTO_DIMENSION}
              justifyContent="center"
              alignItems="center"
            >
              <Text color="pearl">Add photos</Text>
            </Box>
          </Pressable>
        ) : (
          <Box width="100%">
            <FlatList
              data={watchPhotos}
              renderItem={renderPhotoItem}
              keyExtractor={(item, index) => index.toString()}
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
            render={({ field: { value } }) => (
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
      <Box alignItems="center" width="100%">
        <TextButton
          disabled={!isValid || !watchGroup || watchPhotos.length === 0}
          variant="honeyRounded"
          onPress={handleSubmit(onSubmit)}
          label="Post"
        />
      </Box>
    </Box>
  );
};

export default PostCreationForm;
