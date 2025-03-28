import { Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";
import { router } from "expo-router";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { useUpdateGroup } from "@/hooks/api/group";
import { useUserStore } from "@/auth/store";
import Input from "@/design-system/components/shared/controls/input";
import { TextButton } from "@/design-system/components/shared/buttons/text-button";
import { GROUP_SCHEMA, GroupFormData } from "@/utilities/form-schema";

const ChangeNameForm = () => {
  const { group } = useUserStore();
  const { mutateAsync, isPending, isError, error } = useUpdateGroup(group?.id as string);
  const { setSelectedGroup } = useUserStore();

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<GroupFormData>({
    resolver: zodResolver(GROUP_SCHEMA),
    mode: "onTouched",
    defaultValues: {
      name: group?.name,
    },
  });

  const onUpdateGroupPress = async (data: GroupFormData) => {
    try {
      const updatedGroup = await mutateAsync({
        name: data.name,
      });
      if (!isError && !error) {
        setSelectedGroup(updatedGroup);
        router.back();
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        Alert.alert("Validation Errors", errorMessages);
      } else {
        console.error("Error updating group:", err);
      }
    }
  };

  return (
    <Box flexDirection="column" gap="l" flex={1} className="w-full">
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
        <Box width="25%">
          <TextButton
            label="Save"
            onPress={handleSubmit(onUpdateGroupPress)}
            variant="primary"
            disabled={isPending || !isValid}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChangeNameForm;
