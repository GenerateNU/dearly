import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import Input from "@/design-system/components/ui/input";
import { TextButton } from "@/design-system/components/ui/text-button";
import { Box } from "@/design-system/base/box";
import { useOnboarding } from "@/contexts/onboarding";

const EDIT_NAME_SCHEMA = z.object({
  name: z.string({ message: "Invalid name" }),
});

type Name = z.infer<typeof EDIT_NAME_SCHEMA>;

const EditNameForm = () => {
  const { user, setUser, page, setPage } = useOnboarding();

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<Name>({
    resolver: zodResolver(EDIT_NAME_SCHEMA),
    mode: "onTouched",
    defaultValues: {
      name: user.displayName || "",
    },
  });

  const onEditNamePress = async (data: Name) => {
    try {
      const validData = EDIT_NAME_SCHEMA.parse(data);
      await setUser({ displayName: validData.name });
      setPage(page + 1);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      }
    }
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
              title="Display Name"
              placeholder="Enter your display name"
              error={errors.name && errors.name.message}
            />
          )}
        />
      </Box>
      <Box gap="m" alignItems="center" className="w-full">
        <TextButton
          variant="honeyRounded"
          label="Next"
          onPress={handleSubmit(onEditNamePress)}
          disabled={!isValid}
        />
      </Box>
    </Box>
  );
};

export default EditNameForm;
