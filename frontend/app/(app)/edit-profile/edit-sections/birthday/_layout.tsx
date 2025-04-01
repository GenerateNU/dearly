import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { Text } from "@/design-system/base/text";
import { UPDATE_BIRTHDAY_FORM } from "@/utilities/form-schema";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatchUser, useUser } from "@/hooks/api/user";
import { router } from "expo-router";
import { useUserStore } from "@/auth/store";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import SelectBirthdayPopup from "@/app/(auth)/components/birthday-popup";
import Input from "@/design-system/components/shared/controls/input";
import { formatBirthday } from "@/utilities/birthday";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_BIRTHDAY_FORM>;

export default function Layout() {
  const { userId } = useUserStore();
  const { data, error: userError } = useUser(userId!);
  const birthdayRef = useRef<BottomSheet>(null);

  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser(userId!);

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    try {
      await uploadUserData(form);
      router.push("/(app)/edit-profile");
    } catch (err) {
      console.error("Failed to update birthday", err);
    }
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

  const watchedBirthday = useWatch({
    control,
    name: "birthday",
    defaultValue: getValues("birthday"),
  });

  return (
    <Box width="100%" paddingTop="xxl" padding="m" flex={1} gap="l" alignItems="center">
      <Box paddingTop="xxl" width="100%" gap="s">
        <Text variant="body">Birthday</Text>
      </Box>
      <Box width="100%">
        <Input
          isButton
          onPress={() => birthdayRef.current?.snapToIndex(0)}
          value={formatBirthday(watchedBirthday)}
          title="BIRTHDAY"
        />
      </Box>

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

      <SelectBirthdayPopup
        setBirthday={(birthday: Date) => setValue("birthday", birthday)}
        birthday={getValues("birthday")}
        ref={birthdayRef}
      />
    </Box>
  );
}
