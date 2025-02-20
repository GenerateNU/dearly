import { backgroundColor } from "@shopify/restyle";
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
  borderWidth: outline ? 1 : 1,
  borderColor: color,
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
  iconGray: {
    ...baseIcon,
    backgroundColor: "gray",
  },
  iconPearl : {
    ...baseIcon,
    backgroundColor: "pearl"
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
  blushRoundedOutline: createButtonStyle("blush", "full", true),
  honeyRoundedOutline: createButtonStyle("honey", "full", true),
  blushOutline: createButtonStyle("blush", "s", true),
  honeyOutline: createButtonStyle("honey", "s", true),
  slateOutline: createButtonStyle("slate", "s", true),
  slateRoundedOutline: createButtonStyle("slate", "full", true),
  inkOutline: createButtonStyle("ink", "s", true),
  inkRoundedOutline: createButtonStyle("ink", "full", true),
};

export type ButtonVariant = keyof typeof buttonVariants;
