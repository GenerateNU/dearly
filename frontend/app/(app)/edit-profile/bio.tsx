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
import { useIsBasicMode } from "@/hooks/component/mode";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_BIO_FORM>;

const EditBio = () => {
  const { userId } = useUserStore();
  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser(userId!);
  const basic = useIsBasicMode();

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    await uploadUserData(form);
    router.back();
  };

  const { data, error: userError } = useUser(userId!);

  const { control, handleSubmit, setValue, getValues } = useForm<UPDATE_USER_FORM_TYPE>({
    resolver: zodResolver(UPDATE_BIO_FORM),
    defaultValues: { bio: data?.bio ? data?.bio : "" },
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
        name="bio"
        control={control}
        render={() => (
          <Box width={"100%"} paddingTop={!basic ? "xxl" : undefined}>
            <Input
              title={`${basic ? "EDIT" : ""} BIO`}
              paragraph
              placeholder="Enter your bio"
              value={getValues("bio")}
              onChangeText={(str) => {
                setValue("bio", str);
              }}
              maxLength={100}
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
};

export default EditBio;
