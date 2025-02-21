import { useUserState } from "@/auth/provider";
import { Mode } from "@/types/mode";

export const isBasicMode = (): boolean => {
  const { mode } = useUserState();
  return mode === Mode.BASIC;
};
