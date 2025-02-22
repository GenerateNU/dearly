import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { router } from "expo-router";
import Input from "@/design-system/components/ui/input";
import { TextButton } from "@/design-system/components/ui/text-button";
import { AuthRequest } from "@/types/auth";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useUserStore } from "@/auth/store";

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
    <Box gap="l" flexDirection="column" className="w-full">
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
            title="Password"
            placeholder="Enter your password"
            error={errors.password && errors.password.message}
          />
        )}
      />
      {authError && <Text color="error">{authError}</Text>}
      <Box alignItems="center" className="w-full">
        <TextButton
          variant="honeyRounded"
          label={isPending ? "Logging in..." : "Log In"}
          onPress={handleSubmit(onLoginPress)}
          disabled={isPending || !isValid}
        />
      </Box>
      <Box alignItems="center" className="w-full">
        <TextButton
          variant="honeyRounded"
          label={"Login with Biometrics"}
          onPress={onBiometricPress}
          disabled={isPending}
        />
      </Box>
    </Box>
  );
};

export default LoginForm;
