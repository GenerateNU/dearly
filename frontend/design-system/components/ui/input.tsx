import React, { ReactNode } from "react";
import { TextInput, TextInputProps } from "react-native";

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
  value?: string;
  maxLength?: number;
  secureTextEntry?: boolean;
  children?: React.ReactNode;
  paragraph?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
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
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box>
      {title && (
        <Text variant="captionBold" paddingBottom="s">
          {title}
        </Text>
      )}
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
        minHeight={paragraph ? 100 : undefined}
      >
        <Box flex={1} flexDirection="row" alignItems={paragraph ? "flex-start" : "center"}>
          {leftIcon && <Box paddingRight="xs">{leftIcon}</Box>}
          <Box flex={1}>
            <BaseTextInput
              placeholder={placeholder}
              autoFocus={autoFocus}
              readOnly={readOnly}
              inputMode={inputMode}
              placeholderTextColor="#D3D3D3"
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
          </Box>
        </Box>
        {rightIcon && <Box paddingLeft="xs">{rightIcon}</Box>}
      </Box>
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
