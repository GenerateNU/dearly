import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { TextInput } from "react-native";
import { Text } from "@/design-system/base/text";
import { UPDATE_USERNAME_FORM } from "@/utilities/form-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatchUser } from "@/hooks/api/user";
import { router } from "expo-router";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_USERNAME_FORM>;

export default function Layout() {
  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser();

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    await uploadUserData(form);
  };
  const { control, handleSubmit, setValue, trigger, getValues } = useForm<UPDATE_USER_FORM_TYPE>({
    resolver: zodResolver(UPDATE_USERNAME_FORM),
    defaultValues: { username: "" },
  });

  return (
    <Box width="100%" paddingTop="xxl" padding="m" flex={1} gap="l" alignItems="center">
      <Box paddingTop="xxl" width="100%" gap="s">
        <Text variant="body">Username</Text>
      </Box>
      <Controller
        name="username"
        control={control}
        render={() => (
          <TextInput
            className="border border-black-300 p-2 h-12 w-full rounded-lg"
            placeholder="Username..."
            placeholderTextColor="#999"
            onChangeText={(str) => {
              setValue("username", str);
              console.log(getValues());
            }}
          />
        )}
      />
      <TextButton
        onPress={() => {
          handleSubmit(onSubmit);
          router.push("/(app)/edit-profile");
        }}
        label="Save"
        variant="primary"
      />
    </Box>
  );
}
