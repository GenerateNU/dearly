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

const sizes = {
  oneThird: "33%",
  half: "50%",
  full: "100%",
};

const createButtonStyle = (
  width: string,
  backgroundColor: ColorName,
  borderRadius: string | undefined = undefined,
) => ({
  ...baseButton,
  width,
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

  oneThirdBlush: createButtonStyle(sizes.oneThird, "blush", "s"),
  oneThirdBlushRounded: createButtonStyle(sizes.oneThird, "blush", "full"),
  halfBlush: createButtonStyle(sizes.half, "blush", "s"),
  halfBlushRounded: createButtonStyle(sizes.half, "blush", "full"),
  fullBlush: createButtonStyle(sizes.full, "blush", "s"),
  fullBlushRounded: createButtonStyle(sizes.full, "blush", "full"),

  oneThirdPearl: createButtonStyle(sizes.oneThird, "pearl", "s"),
  oneThirdPearlRounded: createButtonStyle(sizes.oneThird, "pearl", "full"),
  halfPearl: createButtonStyle(sizes.half, "pearl", "s"),
  halfPearlRounded: createButtonStyle(sizes.half, "pearl", "full"),
  fullPearl: createButtonStyle(sizes.full, "pearl", "s"),
  fullPearlRounded: createButtonStyle(sizes.full, "pearl", "full"),

  oneThirdHoney: createButtonStyle(sizes.oneThird, "honey", "s"),
  oneThirdHoneyRounded: createButtonStyle(sizes.oneThird, "honey", "full"),
  halfHoney: createButtonStyle(sizes.half, "honey", "s"),
  halfHoneyRounded: createButtonStyle(sizes.half, "honey", "full"),
  fullHoney: createButtonStyle(sizes.full, "honey", "s"),
  fullHoneyRounded: createButtonStyle(sizes.full, "honey", "full"),
};

export type ButtonVariant = keyof typeof buttonVariants;
