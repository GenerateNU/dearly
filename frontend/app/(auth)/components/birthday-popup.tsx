import BottomSheetModal from "@/design-system/components/ui/bottom-sheet";
import { forwardRef } from "react";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useOnboarding } from "@/contexts/onboarding";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Box } from "@/design-system/base/box";

interface BirthdayProps {
  onClose?: () => void;
}

const SelectBirthdayPopup = forwardRef<BottomSheetMethods, BirthdayProps>(({ onClose }, ref) => {
  const { user, setUser } = useOnboarding();

  return (
    <BottomSheetModal snapPoints={["40%"]} ref={ref} onClose={onClose}>
      <Box alignItems="center" justifyContent="center" width="100%">
        <DateTimePicker
          onChange={(_, date) => setUser({ birthday: date })}
          textColor="black"
          display="spinner"
          value={user.birthday || new Date()}
          mode="date"
        />
      </Box>
    </BottomSheetModal>
  );
});

SelectBirthdayPopup.displayName = "SelectBirthdayPopup";
export default SelectBirthdayPopup;
