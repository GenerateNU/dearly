import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { router } from "expo-router";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useUserStore } from "@/auth/store";
import Input from "@/design-system/components/shared/controls/input";
import BackNextButtons from "@/design-system/components/shared/buttons/back-next-buttons";

const EMAIL_SCHEMA = z.object({
  email: z.string().email({ message: "Invalid email" }),
});

type Email = z.infer<typeof EMAIL_SCHEMA>;

const ForgotPasswordForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<Email>({
    resolver: zodResolver(EMAIL_SCHEMA),
    mode: "onTouched",
  });

  const { forgotPassword, isPending, error: authError } = useUserStore();

  const onForgotPasswordPress = async (data: Email) => {
    try {
      const validData = EMAIL_SCHEMA.parse(data);
      await forgotPassword(validData.email);
      router.push("/(auth)/login/check-email");
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
          name="email"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              onChangeText={(text: string) => {
                onChange(text);
                trigger("email");
              }}
              value={value}
              title="Email"
              placeholder="Enter your email"
              error={errors.email && errors.email.message}
            />
          )}
        />
        {authError && (
          <Text variant="caption" color="error">
            {authError}
          </Text>
        )}
      </Box>
      <Box alignItems="center" className="w-full">
        <BackNextButtons
          disablePrev={isPending}
          disableNext={isPending || !isValid}
          onPrev={() => router.back()}
          onNext={handleSubmit(onForgotPasswordPress)}
        />
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;
