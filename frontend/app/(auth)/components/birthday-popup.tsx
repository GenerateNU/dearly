import { forwardRef } from "react";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useOnboarding } from "@/contexts/onboarding";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Box } from "@/design-system/base/box";
import BottomSheetModal from "@/design-system/components/shared/bottom-sheet";

interface BirthdayProps {
  birthday?: Date;
  setBirthday?: (birthday: Date) => void;
}

const SelectBirthdayPopup = forwardRef<BottomSheetMethods, BirthdayProps>(
  ({ birthday, setBirthday }, ref) => {
    const { user, setUser } = useOnboarding();

    return (
      <BottomSheetModal snapPoints={["40%"]} ref={ref}>
        <Box alignItems="center" justifyContent="center" width="100%">
          <DateTimePicker
            onChange={(_, date) => {
              if (setBirthday && date) {
                setBirthday(date);
              } else {
                setUser({ birthday: date });
              }
            }}
            textColor="black"
            display="spinner"
            value={birthday ? birthday : user.birthday || new Date()}
            mode="date"
          />
        </Box>
      </BottomSheetModal>
    );
  },
);

SelectBirthdayPopup.displayName = "SelectBirthdayPopup";
export default SelectBirthdayPopup;
