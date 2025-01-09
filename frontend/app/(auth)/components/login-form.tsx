import React from "react";
import { Alert, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import { router } from "expo-router";
import { useAuthStore } from "@/auth/store";
import Input from "@/design-system/components/input";
import Button from "@/design-system/components/button";
import { AuthRequest } from "@/types/auth";
import Box from "@/design-system/base/box";

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

  const { login, isPending, error: authError } = useAuthStore();

  const onLoginPress = async (loginData: AuthRequest) => {
    try {
      const validData = LOGIN_SCHEMA.parse(loginData);
      await login(validData);
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
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
      {authError && <Text className="text-red-500">{authError}</Text>}
      <Box alignItems="center" className="w-full">
        <Button
          label={isPending ? "Logging in..." : "Log In"}
          onPress={handleSubmit(onLoginPress)}
          disabled={isPending || !isValid}
        />
      </Box>
    </Box>
  );
};

export default LoginForm;
