import { useUserStore } from "@/auth/store";
import SimplePage from "@/design-system/components/shared/simple-page";
import { SafeAreaView } from "react-native-safe-area-context";

const Logout = () => {
  const { logout, isPending, error } = useUserStore();

  return (
    <SafeAreaView className="flex-1 mt-[15%]">
      <SimplePage
        title="Log out?"
        isLoading={isPending}
        isError={true}
        error={error ? new Error(error) : null}
        onPress={logout}
        buttonLabel="Log Out"
        description="Are you sure you want to log out?"
      />
    </SafeAreaView>
  );
};

export default Logout;
