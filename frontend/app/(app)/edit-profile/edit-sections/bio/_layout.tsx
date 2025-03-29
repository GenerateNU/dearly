import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Text } from "@/design-system/base/text";
import { router } from "expo-router";
import { UPDATE_BIO_FORM } from "@/utilities/form-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatchUser } from "@/hooks/api/user";
import { useUserStore } from "@/auth/store";
import { getUser } from "@/api/user";
import { useQuery } from "@tanstack/react-query";
import Input from "@/design-system/components/shared/controls/input";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_BIO_FORM>;

export default function Layout() {
  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser();

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    await uploadUserData(form);
  };

  const { group, userId } = useUserStore();

  const { isError, data } = useQuery({
    queryKey: ["api", "v1", "users", userId],
    queryFn: () => getUser(userId!),
  });

  const { control, handleSubmit, setValue, trigger, getValues } = useForm<UPDATE_USER_FORM_TYPE>({
    resolver: zodResolver(UPDATE_BIO_FORM),
    defaultValues: { bio: data ? data.bio : "Bio..." },
  });

  return (
    <Box width="100%" paddingTop="xxl" padding="m" flex={1} gap="l" alignItems="center">
      <Box paddingTop="xxl" width="100%" gap="s">
        <Text variant="body">Bio</Text>
      </Box>
      <Controller
        name="bio"
        control={control}
        render={() => (
          <Box width={"100%"}>
            <Input
              paragraph
              placeholder={data ? data.bio : "Bio..."}
              onChangeText={(str) => {
                setValue("bio", str);
                console.log(getValues());
              }}
            />
          </Box>
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
