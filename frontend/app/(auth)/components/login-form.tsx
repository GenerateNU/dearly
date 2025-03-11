import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { router } from "expo-router";
import { AuthRequest } from "@/types/auth";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useUserStore } from "@/auth/store";
import Input from "@/design-system/components/shared/controls/input";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import BackNextButtons from "@/design-system/components/shared/buttons/back-next-buttons";

const LOGIN_SCHEMA = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Password required" }),
});

const LoginForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<AuthRequest>({
    resolver: zodResolver(LOGIN_SCHEMA),
    mode: "onTouched",
  });

  const { login, isPending, error: authError, loginWithBiometrics } = useUserStore();

  const onBiometricPress = async () => {
    await loginWithBiometrics();
  };

  const onLoginPress = async (loginData: AuthRequest) => {
    try {
      const validData = LOGIN_SCHEMA.parse(loginData);
      await login(validData);
      const isAuthenticated = useUserStore.getState().isAuthenticated;
      if (isAuthenticated) {
        router.push("/(app)/(tabs)");
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      }
    }
  };

  return (
    <Box flex={1} gap="l" justifyContent="space-between" flexDirection="column" className="w-full">
      <Box gap="l">
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
              title="EMAIL"
              placeholder="Enter your email"
              error={errors.email && errors.email.message}
            />
          )}
        />
        <Box gap="s">
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChangeText={(text: string) => {
                  onChange(text);
                  trigger("password");
                }}
                rightIcon={<Icon onPress={onBiometricPress} name="face-recognition" />}
                secureTextEntry
                value={value}
                title="PASSWORD"
                placeholder="Enter your password"
                error={errors.password && errors.password.message}
              />
            )}
          />
          {authError && (
            <Text variant="caption" color="error">
              {authError}
            </Text>
          )}
          <Box alignItems="flex-end" width="auto">
            <TextButton
              textVariant="caption"
              onPress={() => router.push("/(auth)/forgot-password")}
              variant="text"
              label="Forgot Password?"
            />
          </Box>
        </Box>
      </Box>
      <Box alignItems="center" className="w-full">
        <BackNextButtons
          disablePrev={isPending}
          disableNext={isPending || !isValid}
          onPrev={() => router.back()}
          onNext={handleSubmit(onLoginPress)}
        />
      </Box>
    </Box>
  );
};

export default LoginForm;
