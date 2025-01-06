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

type RegisterFormData = AuthRequest & {
  name: string;
  username: string;
  email: string;
  password: string;
};

const REGISTER_SCHEMA = z.object({
  name: z.string().min(1, {
    message: "Display name is required",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters long",
  }),
  email: z.string().email({ message: "Must be a valid email" }),
  password: z
    .string()
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    })
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(REGISTER_SCHEMA),
    mode: "onTouched",
  });

  const { register, isPending, error: authError } = useAuthStore();

  const onSignUpPress = async (signupData: RegisterFormData) => {
    try {
      const validData = REGISTER_SCHEMA.parse(signupData);
      const data = {
        email: validData.email,
        password: validData.password,
      };

      await register(data);
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      if (isAuthenticated) {
        router.push("/(app)/(tabs)");
      }
    } catch (err: any) {
      if (err instanceof ZodError) {
        Alert.alert(err.errors[0].message);
      }
    }
  };

  return (
    <Box gap="l" flexDirection="column" className="w-full">
      {authError && <Text className="text-red-500">{authError}</Text>}
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
            title="First Name"
            placeholder="Enter your first name"
            error={errors.name && errors.name.message}
          />
        )}
      />
      <Controller
        name="username"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            onChangeText={(text: string) => {
              onChange(text);
              trigger("username");
            }}
            value={value}
            title="Username"
            placeholder="Enter your username"
            error={errors.username && errors.username.message}
          />
        )}
      />
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
      <Box alignItems="center" className="w-full">
        <Button
          disabled={isPending || !isValid}
          label={isPending ? "Signing up..." : "Sign Up"}
          onPress={handleSubmit(onSignUpPress)}
        />
      </Box>
    </Box>
  );
};

export default RegisterForm;
