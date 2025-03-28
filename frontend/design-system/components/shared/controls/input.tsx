import React, { ReactNode } from "react";
import { TextInput, TextInputProps, TouchableOpacity } from "react-native";

import { BoxProps, createBox, useTheme } from "@shopify/restyle";

import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { Theme } from "@/design-system/base/theme";

type TextboxProps = {
  title?: string;
  placeholder?: string;
  error?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  inputMode?: "text" | "numeric" | "search" | "email";
  onChangeText?: (() => void) | ((value: any) => void);
  onBlur?: (() => void) | ((value: any) => void);
  value?: string;
  maxLength?: number;
  secureTextEntry?: boolean;
  children?: React.ReactNode;
  paragraph?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
  isButton?: boolean;
  onPressIn?: () => void;
  onPressOut?: () => void;
} & BoxProps<Theme>;

const BaseTextInput = createBox<Theme, TextboxProps & TextInputProps>(TextInput);

const Input: React.FC<TextboxProps> = ({
  title,
  placeholder,
  error,
  autoFocus = false,
  readOnly = false,
  inputMode = "text",
  onChangeText,
  value,
  maxLength,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  paragraph,
  onBlur,
  onPress,
  isButton = false,
  onPressIn,
  onPressOut,
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box>
      {title && (
        <Text variant="caption" paddingBottom="s">
          {title}
        </Text>
      )}

      <TouchableOpacity onPress={onPress} disabled={!onPress && !isButton} activeOpacity={0.7}>
        <Box
          paddingHorizontal="s"
          padding="xs"
          justifyContent="space-between"
          flexDirection="row"
          borderRadius="s"
          borderWidth={1}
          opacity={readOnly ? 0.5 : 1}
          borderColor={error ? "error" : "slate"}
          alignItems={paragraph ? "flex-start" : "center"}
          minHeight={paragraph ? 130 : undefined}
        >
          <Box flex={1} flexDirection="row" alignItems={paragraph ? "flex-start" : "center"}>
            {leftIcon && <Box paddingRight="xs">{leftIcon}</Box>}
            <Box flex={1}>
              {isButton ? (
                <Text
                  style={{
                    fontSize: theme.textVariants["caption"].fontSize,
                    padding: theme.spacing.s,
                  }}
                >
                  {value || placeholder}
                </Text>
              ) : (
                <BaseTextInput
                  onPressOut={onPressOut}
                  onPressIn={onPressIn}
                  placeholder={placeholder}
                  autoFocus={autoFocus}
                  onBlur={onBlur}
                  readOnly={readOnly}
                  inputMode={inputMode}
                  placeholderTextColor="#5B4E4C"
                  onChangeText={onChangeText}
                  value={value}
                  maxLength={maxLength}
                  secureTextEntry={secureTextEntry}
                  borderRadius="s"
                  padding="s"
                  multiline={paragraph}
                  numberOfLines={paragraph ? 4 : 1}
                  textAlignVertical={paragraph ? "top" : "center"}
                  style={{
                    fontSize: theme.textVariants["caption"].fontSize,
                  }}
                  borderColor={error ? "error" : "slate"}
                />
              )}
            </Box>
          </Box>
          {rightIcon && <Box paddingLeft="xs">{rightIcon}</Box>}
        </Box>
      </TouchableOpacity>

      {error && (
        <Box paddingTop="xs" flexDirection="row" alignItems="center">
          <Text variant="caption" color="error">
            {error}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Input;
