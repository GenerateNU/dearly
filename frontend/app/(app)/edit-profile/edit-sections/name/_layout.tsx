import logout from "@/app/(app)/logout";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { SafeAreaView, TextInput } from "react-native";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { useState } from "react";
import { UPDATE_USER_FORM } from "@/utilities/form-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatchUser } from "@/hooks/api/user";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_USER_FORM>;

export default function Layout() {
  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser();

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    const res = await uploadUserData(form);
    router.push("/(app)/edit-profile");
  };
  const { control, handleSubmit, setValue, trigger, getValues } = useForm<UPDATE_USER_FORM_TYPE>({
    resolver: zodResolver(UPDATE_USER_FORM),
    defaultValues: { name: "" },
  });

  return (
    <Box width="100%" paddingTop="xxl" padding="m" flex={1} gap="l" alignItems="center">
      <Box paddingTop="xxl" width="100%" gap="s">
        <Text variant="body">Name</Text>
      </Box>
      <Controller
        name="name"
        control={control}
        render={() => (
          <TextInput
            className="border border-black-300 p-2 h-12 w-full rounded-lg"
            placeholder="Name..."
            placeholderTextColor="#999"
            onChangeText={(str) => {
              setValue("name", str);
            }}
          />
        )}
      />
      <TextButton onPress={handleSubmit(onSubmit)} label="Save" variant="primary" />
    </Box>
  );
}
