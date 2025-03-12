import { ColorName } from "../config/color";

const baseButton = {
  padding: "s",
  alignItems: "center",
  justifyContent: "center",
};

const baseIcon = {
  width: "auto",
  padding: "s",
  borderRadius: "full",
  aspectRatio: 1,
};

const createButtonStyle = (
  color: ColorName,
  borderRadius: string | undefined = undefined,
  outline?: boolean,
) => ({
  ...baseButton,
  width: "100%",
  backgroundColor: outline ? "" : color,
  borderRadius,
  borderWidth: outline ? 2 : 1,
  borderColor: color,
});

export const buttonVariants = {
  icon: {
    ...baseIcon,
    backgroundColor: "honey",
  },
  text: {
    width: "auto",
  },
  primary: createButtonStyle("honey", "full"),
  secondary: createButtonStyle("darkGray", "full", true),
};

export type ButtonVariant = keyof typeof buttonVariants;
