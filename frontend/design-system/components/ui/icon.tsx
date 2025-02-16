import { MaterialIcon } from "@/types/icon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface IconProps {
  name: MaterialIcon;
  color: string;
  size: number;
}

export const Icon: React.FC<IconProps> = ({ name, color, size }) => {
  return <MaterialCommunityIcons name={name} color={color} size={size} />;
};
