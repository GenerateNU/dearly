import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { Box } from "@/design-system/base/box";
import { useOnboarding } from "@/contexts/onboarding";
import { router } from "expo-router";
import Input from "@/design-system/components/shared/controls/input";
import BackNextButtons from "@/design-system/components/shared/buttons/back-next-buttons";

const EDIT_NAME_SCHEMA = z.object({
  name: z.string({ message: "Invalid name" }),
});

type Name = z.infer<typeof EDIT_NAME_SCHEMA>;

const EditNameForm = () => {
  const { user, setUser, setPage, page } = useOnboarding();

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<Name>({
    resolver: zodResolver(EDIT_NAME_SCHEMA),
    mode: "onTouched",
    defaultValues: {
      name: user.name || "",
    },
  });

  const onEditNamePress = async (data: Name) => {
    try {
      const validData = EDIT_NAME_SCHEMA.parse(data);
      await setUser({ name: validData.name });
      setPage(4);
      router.push("/(auth)/birthday");
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      }
    }
  };

  const onPrev = () => {
    setPage(page - 1);
    router.back();
  };

  return (
    <Box flexDirection="column" justifyContent="space-between" gap="l" flex={1} className="w-full">
      <Box>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              onChangeText={(text: string) => {
                onChange(text);
                trigger("name");
              }}
              value={value}
              title="DISPLAY NAME"
              placeholder="Enter your display name"
              error={errors.name && errors.name.message}
            />
          )}
        />
      </Box>
      <Box gap="m" alignItems="center" className="w-full">
        <BackNextButtons
          disableNext={!isValid}
          onPrev={onPrev}
          onNext={handleSubmit(onEditNamePress)}
        />
      </Box>
    </Box>
  );
};

export default EditNameForm;
