import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { router } from "expo-router";
import { UPDATE_BIO_FORM } from "@/utilities/form-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatchUser, useUser } from "@/hooks/api/user";
import { useUserStore } from "@/auth/store";
import Input from "@/design-system/components/shared/controls/input";
import { Text } from "@/design-system/base/text";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_BIO_FORM>;

export default function Layout() {
  const { userId } = useUserStore();
  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser(userId!);

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    await uploadUserData(form);
    router.push("/(app)/edit-profile");
  };

  const { data, error: userError } = useUser(userId!);

  const { control, handleSubmit, setValue } = useForm<UPDATE_USER_FORM_TYPE>({
    resolver: zodResolver(UPDATE_BIO_FORM),
  });

  return (
    <Box width="100%" className="mt-[20%]" padding="m" flex={1} gap="l" alignItems="center">
      <Box width="100%" gap="s">
        <Text variant="body">Bio</Text>
      </Box>
      <Controller
        name="bio"
        control={control}
        render={() => (
          <Box width={"100%"}>
            <Input
              paragraph
              placeholder="Enter your bio"
              value={data?.bio ?? undefined}
              onChangeText={(str) => {
                setValue("bio", str);
              }}
              error={error || userError ? "Failed to fetch your bio." : undefined}
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
