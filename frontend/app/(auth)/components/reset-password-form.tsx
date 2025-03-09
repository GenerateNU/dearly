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
import { supabase } from "@/auth/client";

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

  

  useEffect(() => {
    // Function to extract token from URL
    const handleDeepLink = (url:string) => {
      if (url) {
        console.log("Received deep link:", url);

        // Extract query parameters
        const params = new URL(url).searchParams;
        console.log(params)
        const token = params.get("access_token");

        if (token) {
          console.log("Extracted token:", token);
          // Handle the token (e.g., navigate to reset password screen)
        } else {
          console.warn("No token found in deep link");
        }
      }
    };

    

    // Get initial URL when the app is opened from a closed state
    // Linking.getInitialURL()
    //   .then((url) => {
    //     if (url) handleDeepLink(url);
    //   })
    //   .catch((err) => console.error("Error getting initial URL:", err));

    

    // Listen for deep links while the app is running
    // const subscription = Linking.addEventListener("url", (event) => {
    //   handleDeepLink(event.url);
    // });

    // const { data, error } = await supabase.auth.getSession();
    // console.log("checking session...")
    // console.log(data)
    // console.log(error)
    
    const subscription = Linking.addEventListener("url", async (event) => {
      const parseSupabaseUrl = (url: string) => {
        console.log(`Parsing full url: ${url}`)

        let parsedUrl = url;
        if (url.includes("#")) {
          parsedUrl = url.replace("#", "?");
        }
        return Linking.parse(parsedUrl);
      };
      const url = parseSupabaseUrl(event.url);
  
      console.log("parsed url", url);
  
  
      const access_token = url.queryParams?.access_token;
      const refresh_token = url.queryParams?.refresh_token;
      if (typeof access_token === "string" && typeof refresh_token === "string") {
        console.log(`Access_token: ${access_token}`)
        console.log(`refresh_token: ${refresh_token}`)
      
        const { data: setSessionData, error: setSessionError } =
          await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token,
          });
        console.log("setSessionData", setSessionData);
        console.log("setSessionError", setSessionError);
      } else {
        console.log("No url found")
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
