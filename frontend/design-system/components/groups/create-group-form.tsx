import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";
import { RelativePathString, router } from "expo-router";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useCreateGroup } from "@/hooks/api/group";
import BackNextButtons from "../shared/buttons/back-next-buttons";
import Input from "../shared/controls/input";
import { useUserStore } from "@/auth/store";
import { GROUP_SCHEMA, GroupFormData } from "@/utilities/form-schema";

interface CreateGroupProps {
  nextPageNavigate: string;
}

const CreateGroupForm: React.FC<CreateGroupProps> = ({ nextPageNavigate }) => {
  const { mutateAsync, isPending, isError, error } = useCreateGroup();
  const { setSelectedGroup } = useUserStore();

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<GroupFormData>({
    resolver: zodResolver(GROUP_SCHEMA),
    mode: "onTouched",
  });

  const onCreateGroupPress = async (data: GroupFormData) => {
    try {
      const newGroup = await mutateAsync({
        name: data.name,
      });
      if (!isError && !error) {
        setSelectedGroup(newGroup);
        router.push({
          pathname: nextPageNavigate as RelativePathString,
          params: { id: newGroup.id, name: newGroup.name },
        });
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      } else {
        console.error("Error creating group:", err);
      }
    }
  };

  return (
    <Box flexDirection="column" justifyContent="space-between" gap="l" flex={1} className="w-full">
      <Box>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              onChangeText={(text: string) => {
                onChange(text);
                trigger("name");
              }}
              value={value}
              title="GROUP NAME"
              placeholder="Enter group name"
              error={errors.name && errors.name.message}
            />
          )}
        />
        {isError && (
          <Text variant="caption" color="error">
            {error.message}
          </Text>
        )}
      </Box>
      <Box alignItems="center" className="w-full">
        <BackNextButtons
          disablePrev={isPending}
          disableNext={isPending || !isValid}
          onPrev={() => router.back()}
          onNext={handleSubmit(onCreateGroupPress)}
        />
      </Box>
    </Box>
  );
};

export default CreateGroupForm;
