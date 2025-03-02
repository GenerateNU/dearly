import React from "react";
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
      router.push("/(auth)/check-email");
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
      <Box gap="m" alignItems="center" className="w-full">
        <TextButton variant="blushRounded" label="Back" onPress={router.back} />
        <TextButton
          variant="honeyRounded"
          label="Next"
          onPress={handleSubmit(onForgotPasswordPress)}
          disabled={isPending || !isValid}
        />
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;
