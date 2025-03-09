import { useState } from "react";
import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { router } from "expo-router";
import Input from "@/design-system/components/ui/input";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useUserStore } from "@/auth/store";
import BackNextButtons from "../../../design-system/components/ui/back-next-buttons";

const RESET_PASSWORD_SCHEMA = z
  .object({
    password: z
      .string()
      .regex(/[0-9]/, {
        message: "Password must contain at least one number",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      })
      .min(8, { message: "Password must be at least 8 characters long" }),
    retypedPassword: z.string(),
  })
  .refine((data) => data.password === data.retypedPassword, {
    path: ["retypedPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordType = z.infer<typeof RESET_PASSWORD_SCHEMA>;

const ResetPasswordForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(RESET_PASSWORD_SCHEMA),
    mode: "onTouched",
  });

  const { resetPassword, isPending, error: authError } = useUserStore();
  const [isPasswordConfirmationTouched, setIsPasswordConfirmationTouched] = useState(false);

  const onResetPasswordPress = async (data: ResetPasswordType) => {
    try {
      const validData = RESET_PASSWORD_SCHEMA.parse(data);
      await resetPassword(validData.password);
      router.push("/(auth)");
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      }
    }
  };

  return (
    <Box flex={1} flexDirection="column" gap="l" justifyContent="space-between">
      <Box gap="m">
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              onChangeText={(text: string) => {
                onChange(text);
                trigger("password");
              }}
              secureTextEntry
              value={value}
              title="NEW PASSWORD"
              placeholder="Enter your password"
              error={errors.password && errors.password.message}
            />
          )}
        />
        <Controller
          name="retypedPassword"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              secureTextEntry
              value={value}
              title="CONFIRM YOUR PASSWORD"
              placeholder="Retype your password"
              onChangeText={(text: string) => {
                onChange(text);
                trigger("retypedPassword");
                setIsPasswordConfirmationTouched(true);
              }}
              error={
                isPasswordConfirmationTouched && value !== control._getWatch("password")
                  ? "Passwords do not match"
                  : undefined
              }
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
          onPrev={() => router.push("/(auth)")}
          onNext={handleSubmit(onResetPasswordPress)}
        />
      </Box>
    </Box>
  );
};

export default ResetPasswordForm;
