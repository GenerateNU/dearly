import { useUserStore } from "@/auth/store";
import User from "@/design-system/components/profiles/user";

const ProfilePage = () => {
  const { userId } = useUserStore();
  return <User id={userId!} />;
};

export default ProfilePage;
