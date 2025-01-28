import React from "react";
import { TextInput, TextInputProps } from "react-native";

import { BoxProps, createBox } from "@shopify/restyle";

import { Theme } from "../base/theme";
import Box from "../base/box";
import Text from "../base/text";

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
}) => {
  return (
    <Box>
      <Text paddingBottom="s">{title}</Text>
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
        opacity={readOnly ? 0.5 : 1}
        borderWidth={1}
        borderRadius="s"
        padding="s"
        borderColor={error ? "error" : "secondaryDark"}
      />
      {error && (
        <Box gap="xxs" flexDirection="row" alignItems="center">
          <Text color="error" variant="secondary">
            {error}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Input;
