import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError } from "zod";
import Input from "@/design-system/components/ui/input";
import { AuthRequest } from "@/types/auth";
import { Box } from "@/design-system/base/box";
import { useOnboarding } from "@/contexts/onboarding";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import BackNextButtons from "../../../design-system/components/ui/back-next-buttons";
import { PASSWORD_SCHEMA } from "@/utilities/password";

type RegisterFormData = AuthRequest & {
  username: string;
  retypedPassword: string;
};

const REGISTER_SCHEMA = z
  .object({
    username: z
      .string()
      .min(2, {
        message: "Username must be at least 2 characters long",
      })
      .refine((s) => !s.includes(" ")),
    email: z.string().email({ message: "Must be a valid email" }),
  })
  .merge(PASSWORD_SCHEMA)
  .refine((data) => data.password === data.retypedPassword, {
    path: ["retypedPassword"],
    message: "Passwords do not match",
  });

const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(REGISTER_SCHEMA),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      retypedPassword: "",
    },
  });

  const { setPage, page, setUser } = useOnboarding();
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [retypedPasswordTouched, setRetypedPasswordTouched] = useState(false);

  const password = watch("password");
  const retypedPassword = watch("retypedPassword");
  const [passwordMatchError, setPasswordMatchError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (passwordTouched && retypedPasswordTouched && password && retypedPassword) {
      if (password !== retypedPassword) {
        setPasswordMatchError("Passwords do not match");
      } else {
        setPasswordMatchError(undefined);
      }
    }
  }, [password, retypedPassword, passwordTouched, retypedPasswordTouched]);

  const onSignUpPress = async (signupData: RegisterFormData) => {
    try {
      const validData = REGISTER_SCHEMA.parse(signupData);
      const data = {
        username: validData.username,
        email: validData.email,
        password: validData.password,
      };
      setUser(data);
      setPage(3);
      router.push("/(auth)/edit-profile");
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      }
    }
  };

  const onPrev = () => {
    setPage(page - 1);
    router.back();
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
              title="EMAIL"
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
              title="USERNAME"
              placeholder="Enter your username"
              error={errors.username && errors.username.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              onChangeText={(text: string) => {
                onChange(text);
                setPasswordTouched(true);
                trigger("password");
                if (retypedPasswordTouched) {
                  trigger("retypedPassword");
                }
              }}
              secureTextEntry
              value={value}
              title="PASSWORD"
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
              title="CONFIRM PASSWORD"
              placeholder="Passwords must match"
              onChangeText={(text: string) => {
                onChange(text);
                setRetypedPasswordTouched(true);
                trigger("retypedPassword");
              }}
              error={
                passwordMatchError || (errors.retypedPassword && errors.retypedPassword.message)
              }
            />
          )}
        />
      </Box>
      <Box gap="m" alignItems="center" className="w-full">
        <BackNextButtons
          disableNext={!isValid || !!passwordMatchError}
          onPrev={onPrev}
          onNext={handleSubmit(onSignUpPress)}
        />
      </Box>
    </Box>
  );
};

export default RegisterForm;
