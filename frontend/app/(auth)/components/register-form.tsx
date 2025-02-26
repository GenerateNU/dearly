import React, { useState } from "react";
import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import Input from "@/design-system/components/ui/input";
import { TextButton } from "@/design-system/components/ui/text-button";
import { AuthRequest } from "@/types/auth";
import { Box } from "@/design-system/base/box";
import { useOnboarding } from "@/contexts/onboarding";

type RegisterFormData = AuthRequest & {
  username: string;
  retypedPassword: string;
};

const REGISTER_SCHEMA = z
  .object({
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
    retypedPassword: z.string(),
  })
  .refine((data) => data.password === data.retypedPassword, {
    path: ["retypedPassword"],
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

  const [isPasswordConfirmationTouched, setIsPasswordConfirmationTouched] = useState(false);
  const { setPage, page, setUser } = useOnboarding();

  const onSignUpPress = async (signupData: RegisterFormData) => {
    try {
      const validData = REGISTER_SCHEMA.parse(signupData);
      const data = {
        username: validData.username,
        email: validData.email,
        password: validData.password,
      };
      setUser(data);
      setPage(page + 1);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      }
    }
  };

  return (
    <Box flex={1} gap="l" justifyContent="space-between" flexDirection="column" className="w-full">
      <Box gap="m">
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
        <Controller
          name="retypedPassword"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              secureTextEntry
              value={value}
              title="Retype Password"
              placeholder="Passwords must match"
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
      </Box>
      <Box gap="m" alignItems="center" className="w-full">
        <TextButton
          variant="honeyRounded"
          label="Next"
          onPress={handleSubmit(onSignUpPress)}
          disabled={!isValid}
        />
      </Box>
    </Box>
  );
};

export default RegisterForm;
