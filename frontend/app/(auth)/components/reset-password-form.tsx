import React, { useState } from "react";
import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { router } from "expo-router";
import Input from "@/design-system/components/ui/input";
import { TextButton } from "@/design-system/components/ui/text-button";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useUserStore } from "@/auth/store";

const RESET_PASSWORD_SCHEMA = z
  .object({
    retypedPassword: z.string().min(1, { message: "Required" }),
    password: z.string().min(1, { message: "Required" }),
  })
  .refine((data) => data.password === data.retypedPassword, {
    path: ["retypedPassword"],
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
      const isAuthenticated = useUserStore.getState().isAuthenticated;
      if (isAuthenticated) {
        router.push("/(auth)/welcome");
      }
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
        <Box gap="xs">
          <Text variant="bodyLargeBold">Reset Password</Text>
          <Text variant="body">Enter your new password below, passwords must match</Text>
        </Box>
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
              title="New Password"
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
              title="Password Confirmation"
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
      <Box gap="m" alignItems="center" className="w-full">
        <TextButton variant="blushRounded" label="Back" onPress={router.back} />
        <TextButton
          variant="honeyRounded"
          label="Next"
          onPress={handleSubmit(onResetPasswordPress)}
          disabled={isPending || !isValid}
        />
      </Box>
    </Box>
  );
};

export default ResetPasswordForm;
