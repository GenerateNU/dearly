import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { UPDATE_USER_FORM } from "@/utilities/form-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatchUser, useUser } from "@/hooks/api/user";
import { useUserStore } from "@/auth/store";
import Input from "@/design-system/components/shared/controls/input";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_USER_FORM>;

export default function Layout() {
  const { userId } = useUserStore();
  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser(userId!);

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    await uploadUserData(form);
    router.push("/(app)/edit-profile");
  };

  const { data, error: userError } = useUser(userId!);

  const { control, handleSubmit, setValue, getValues } = useForm<UPDATE_USER_FORM_TYPE>({
    resolver: zodResolver(UPDATE_USER_FORM),
    defaultValues: { name: data?.name ? data?.name : "" },
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
          <Box width="100%">
            <Input
              placeholder="Enter your name"
              value={getValues("name")}
              onChangeText={(str) => {
                setValue("name", str);
              }}
              error={
                error
                  ? "Failed to update name. Please try again later."
                  : userError
                    ? "Failed to fetch your name."
                    : undefined
              }
            />
          </Box>
        )}
      />
      <TextButton
        disabled={isPending}
        onPress={handleSubmit(onSubmit)}
        label="Save"
        variant="primary"
      />
    </Box>
  );
}
