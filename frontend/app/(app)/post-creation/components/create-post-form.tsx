import { Box } from "@/design-system/base/box";
import { Dropdown } from "@/design-system/components/ui/dropdown";
import { Icon } from "@/design-system/components/ui/icon";
import Input from "@/design-system/components/ui/input";
import { TextButton } from "@/design-system/components/ui/text-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const CREATE_POST_SCHEMA = z.object({
  caption: z
    .string()
    .max(500, {
      message: "Caption must be at most 500 characters",
    })
    .optional(),
  location: z
    .string()
    .max(100, {
      message: "Location must be at most 100 characters long",
    })
    .optional(),
  group: z.string().optional(),
});

type CreatePostData = z.infer<typeof CREATE_POST_SCHEMA>;
type DropdownItem = { label: string; value: string };

export const PostCreationForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    setValue: setFormValue,
    formState: { errors, isValid },
  } = useForm<CreatePostData>({
    resolver: zodResolver(CREATE_POST_SCHEMA),
    mode: "onChange",
  });

  const [groupValue, setGroupValue] = useState<string | null>(null);
  const [groupItems, setGroupItems] = useState<DropdownItem[]>([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);

  const onSubmit = (data: CreatePostData) => {
    console.log("Form submitted:", data);
  };

  const handleGroupChange = (newValue: string | null) => {
    if (newValue) {
      setFormValue("group", newValue);
    } else {
      setFormValue("group", undefined);
    }
  };

  return (
    <Box flex={1} gap="m" width="100%" alignItems="center" justifyContent="space-between">
      <Box gap="xl" width="100%" alignItems="center" justifyContent="center">
        <Box borderRadius="s" backgroundColor="slate" height={200} width={200}></Box>
        <Box gap="s" width="100%">
          <TextButton variant="blushRounded" onPress={() => null} label="Add photos" />
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
            render={({ field }) => (
              <Dropdown
                value={groupValue}
                setValue={(val) => {
                  setGroupValue(val);
                  if (typeof val === "function") {
                    const newVal = val(groupValue);
                    handleGroupChange(newVal);
                  } else {
                    handleGroupChange(val);
                  }
                }}
                items={groupItems}
                setItems={setGroupItems}
              />
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
      <Box alignItems="center" className="w-full">
        <TextButton variant="honeyRounded" onPress={handleSubmit(onSubmit)} label="Post" />
      </Box>
    </Box>
  );
};
