import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { UPDATE_USERNAME_FORM } from "@/utilities/form-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatchUser, useUser } from "@/hooks/api/user";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";
import Input from "@/design-system/components/shared/controls/input";
import { useIsBasicMode } from "@/hooks/component/mode";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_USERNAME_FORM>;

const EditUsername = () => {
  const { userId } = useUserStore();
  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser(userId!);
  const { data, error: userError } = useUser(userId!);
  const basic = useIsBasicMode();

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    await uploadUserData(form);
    router.back();
  };
  const { control, handleSubmit, setValue, getValues } = useForm<UPDATE_USER_FORM_TYPE>({
    resolver: zodResolver(UPDATE_USERNAME_FORM),
    defaultValues: { username: data?.username ? data?.username : "" },
  });

  return (
    <Box
      width="100%"
      marginTop={basic ? "m" : "xxl"}
      paddingHorizontal="m"
      flex={1}
      gap="m"
      alignItems="center"
    >
      <Controller
        name="username"
        control={control}
        render={() => (
          <Box width="100%" paddingTop={!basic ? "xxl" : undefined}>
            <Input
              title={`${basic ? "EDIT" : ""} USERNAME`}
              placeholder="Enter your username"
              value={getValues("username")}
              onChangeText={(str) => {
                setValue("username", str);
              }}
              error={
                error
                  ? "Failed to update username. Please try again later."
                  : userError
                    ? "Failed to fetch your username. "
                    : undefined
              }
            />
          </Box>
        )}
      />
      <Box width="30%">
        <TextButton
          disabled={isPending}
          onPress={handleSubmit(onSubmit)}
          label="Save"
          variant="primary"
        />
      </Box>
    </Box>
  );
};

export default EditUsername;
