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
  backgroundColor: ColorName,
  borderRadius: string | undefined = undefined,
) => ({
  ...baseButton,
  width: "100%",
  backgroundColor,
  borderRadius,
});

export const buttonVariants = {
  iconBlush: {
    ...baseIcon,
    backgroundColor: "blush",
  },
  iconHoney: {
    ...baseIcon,
    backgroundColor: "honey",
  },
  text: {
    width: "auto",
  },

  pearl: createButtonStyle("pearl", "s"),
  pearlRounded: createButtonStyle("pearl", "full"),
  blush: createButtonStyle("blush", "s"),
  blushRounded: createButtonStyle("blush", "full"),
  honey: createButtonStyle("honey", "s"),
  honeyRounded: createButtonStyle("honey", "full"),
};

export type ButtonVariant = keyof typeof buttonVariants;
