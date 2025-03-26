import React, { useEffect, useRef } from "react";
import { TextInput } from "react-native";

export const KeyboardUp = () => {
  const hiddenInput = useRef<TextInput>(null); // this is used to keep recording component above keyboard
  useEffect(() => {
    const keepKeyboardUp = () => {
      if (hiddenInput.current) {
        hiddenInput.current.focus();
      }
    };
    keepKeyboardUp();
    const intervalId = setInterval(keepKeyboardUp, 500);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <TextInput
      ref={hiddenInput}
      autoFocus={true}
      caretHidden={true}
      style={{
        position: "absolute",
        height: 0,
        width: 0,
        opacity: 0,
      }}
    />
  );
};
