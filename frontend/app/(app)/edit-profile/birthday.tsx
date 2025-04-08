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
import { useIsBasicMode } from "@/hooks/component/mode";

type UPDATE_USER_FORM_TYPE = z.infer<typeof UPDATE_BIRTHDAY_FORM>;

const EditBirthday = () => {
  const { userId } = useUserStore();
  const { data, error: userError } = useUser(userId!);
  const birthdayRef = useRef<BottomSheet>(null);
  const basic = useIsBasicMode();

  const { mutateAsync: uploadUserData, error, isPending } = usePatchUser(userId!);

  const onSubmit = async (form: UPDATE_USER_FORM_TYPE) => {
    try {
      await uploadUserData(form);
      router.back();
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
    <Box
      width="100%"
      marginTop={basic ? "m" : "xxl"}
      paddingHorizontal="m"
      flex={1}
      gap="m"
      alignItems="center"
    >
      <Box width="100%" paddingTop={!basic ? "xxl" : undefined}>
        <Input
          title={`${basic ? "EDIT" : ""} BIRTHDAY`}
          isButton
          onPress={() => birthdayRef.current?.snapToIndex(0)}
          value={formatBirthday(watchedBirthday)}
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

      <Box width="30%">
        <TextButton
          disabled={isPending}
          onPress={handleSubmit(onSubmit)}
          label="Save"
          variant="primary"
        />
      </Box>

      <SelectBirthdayPopup
        setBirthday={(birthday: Date) => setValue("birthday", birthday)}
        birthday={getValues("birthday")}
        ref={birthdayRef}
      />
    </Box>
  );
};

export default EditBirthday;
