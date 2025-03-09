import { useEffect, useState } from "react";
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
import * as Linking from "expo-linking";
import { PASSWORD_SCHEMA } from "@/utilities/password";
import { TokenPayload } from "@/types/auth";

export const PASSWORD_CONFIRM_SCHEMA = PASSWORD_SCHEMA.refine(
  (data) => data.password === data.retypedPassword,
  {
    path: ["retypedPassword"],
    message: "Passwords do not match",
  },
);

type ResetPasswordType = z.infer<typeof PASSWORD_CONFIRM_SCHEMA>;

const ResetPasswordForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(PASSWORD_CONFIRM_SCHEMA),
    mode: "onTouched",
  });

  const deeplink = Linking.useLinkingURL();

  const { resetPassword, isPending, error: authError } = useUserStore();
  const [isPasswordConfirmationTouched, setIsPasswordConfirmationTouched] = useState(false);
  const [linkError, setLinkError] = useState<String | null>(null);
  const [tokens, setTokens] = useState<TokenPayload>();

  useEffect(() => {
    if (!deeplink) return;

    const url = new URL(deeplink);
    const params = new URLSearchParams(url.hash.replace("#", "?"));

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const linkError = params.get("error_description");

    if (linkError || !accessToken || !refreshToken) {
      setLinkError(linkError);
      return;
    }

    setTokens({ accessToken, refreshToken });
  }, []);

  const onResetPasswordPress = async (data: ResetPasswordType) => {
    try {
      if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error("Failed to reset password. Please try again.");
      }

      if (authError) return;

      const validData = PASSWORD_CONFIRM_SCHEMA.parse(data);
      await resetPassword({
        password: validData.password,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
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
        {linkError && (
          <Text variant="caption" color="error">
            {`Error with link: ${linkError}`}
          </Text>
        )}
      </Box>
      <Box alignItems="center" className="w-full">
        <BackNextButtons
          disablePrev={isPending}
          disableNext={isPending || !isValid || linkError !== null}
          onPrev={() => router.push("/(auth)")}
          onNext={handleSubmit(onResetPasswordPress)}
        />
      </Box>
    </Box>
  );
};

export default ResetPasswordForm;
