import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Text } from "@/design-system/base/text";
import { UPDATE_BIRTHDAY_FORM } from "@/utilities/form-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatchUser, useUser } from "@/hooks/api/user";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_BIRTHDAY_FORM>;

export default function Layout() {
  const { userId } = useUserStore();
  const { data, error: userError } = useUser(userId!);

  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser(userId!);

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    await uploadUserData(form);
    router.push("/(app)/edit-profile");
  };

  const parseBirthday = (dateString: string | undefined) => {
    if (!dateString) return new Date();

    const parts = dateString?.split("T")[0]?.split("-");
    if (!parts || parts.length !== 3) return new Date();

    if (!parts[0] || !parts[1] || !parts[2]) return;
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  const { control, handleSubmit, setValue, getValues } = useForm<UPDATE_USER_FORM_TYPE>({
    resolver: zodResolver(UPDATE_BIRTHDAY_FORM),
    defaultValues: { birthday: parseBirthday(data?.birthday ? data?.birthday : undefined) },
  });

  return (
    <Box width="100%" paddingTop="xxl" padding="m" flex={1} gap="l" alignItems="center">
      <Box paddingTop="xxl" width="100%" gap="s">
        <Text variant="body">Birthday</Text>
      </Box>
      <Controller
        name="birthday"
        control={control}
        render={() => (
          <DateTimePicker
            onChange={(_, date) => setValue("birthday", date!)}
            textColor="black"
            display="spinner"
            value={getValues("birthday")}
            mode="date"
          />
        )}
      />
      {userError && (
        <Text variant="caption" color="error">
          Failed to fetch your birthday. Please try again later.
        </Text>
      )}
      {error && (
        <Text variant="caption" color="error">
          Failed to update birthday. Please try again later.
        </Text>
      )}
      <TextButton
        disabled={isPending}
        onPress={handleSubmit(onSubmit)}
        label="Save"
        variant="primary"
      />
    </Box>
  );
}
