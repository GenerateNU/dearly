import { useOnboarding } from "@/contexts/onboarding";
import { Box } from "@/design-system/base/box";
import { TextButton } from "@/design-system/components/ui/text-button";

export const NextButton = () => {
  const { page, setPage } = useOnboarding();

  return (
    <Box alignItems="center" className="w-full">
      <TextButton variant="honeyRounded" label="Create Profile" onPress={() => setPage(page + 1)} />
    </Box>
  );
};
