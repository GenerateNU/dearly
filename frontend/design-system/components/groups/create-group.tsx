import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import CreateGroupForm from "@/design-system/components/groups/create-group-form";

interface CreateGroupProps {
  nextPageNavigate: string;
}

const CreateGroupComponent: React.FC<CreateGroupProps> = ({ nextPageNavigate }) => {
  return (
    <Box flex={1} paddingBottom="l" padding="m" justifyContent="space-between">
      <Text paddingBottom="l" variant="bodyLargeBold">
        Create Group
      </Text>
      <CreateGroupForm nextPageNavigate={nextPageNavigate} />
    </Box>
  );
};

export default CreateGroupComponent;
