import { useAuth } from "@/auth/provider";
import Box from "@/design-system/base/box";
import Button from "@/design-system/components/button";
import { Mode } from "@/types/mode";
import { router } from "expo-router";
import { Image, Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";

const Index = () => {
  const { setMode, mode } = useAuth();
  const { width } = Dimensions.get('window');

  const images = [
    "https://dearly.s3.us-east-1.amazonaws.com/cf819a23-a6f4-4b0d-8437-cbe006e8a793?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS2VS4R2NOZNEEFON%2F20250208%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250208T170814Z&X-Amz-Expires=86400&X-Amz-Signature=51b4e3abff3d3e005f58ef920480cf8a2fa88ffb30c9aa8d5055a1e794d2af6d&X-Amz-SignedHeaders=host&response-content-disposition=inline&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    // Adding more similar images - in practice, you'd have different URLs
    "https://dearly.s3.us-east-1.amazonaws.com/cf819a23-a6f4-4b0d-8437-cbe006e8a793?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS2VS4R2NOZNEEFON%2F20250208%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250208T170814Z&X-Amz-Expires=86400&X-Amz-Signature=51b4e3abff3d3e005f58ef920480cf8a2fa88ffb30c9aa8d5055a1e794d2af6d&X-Amz-SignedHeaders=host&response-content-disposition=inline&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    "https://dearly.s3.us-east-1.amazonaws.com/cf819a23-a6f4-4b0d-8437-cbe006e8a793?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS2VS4R2NOZNEEFON%2F20250208%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250208T170814Z&X-Amz-Expires=86400&X-Amz-Signature=51b4e3abff3d3e005f58ef920480cf8a2fa88ffb30c9aa8d5055a1e794d2af6d&X-Amz-SignedHeaders=host&response-content-disposition=inline&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    "https://dearly.s3.us-east-1.amazonaws.com/cf819a23-a6f4-4b0d-8437-cbe006e8a793?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS2VS4R2NOZNEEFON%2F20250208%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250208T170814Z&X-Amz-Expires=86400&X-Amz-Signature=51b4e3abff3d3e005f58ef920480cf8a2fa88ffb30c9aa8d5055a1e794d2af6d&X-Amz-SignedHeaders=host&response-content-disposition=inline&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    "https://dearly.s3.us-east-1.amazonaws.com/cf819a23-a6f4-4b0d-8437-cbe006e8a793?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS2VS4R2NOZNEEFON%2F20250208%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250208T170814Z&X-Amz-Expires=86400&X-Amz-Signature=51b4e3abff3d3e005f58ef920480cf8a2fa88ffb30c9aa8d5055a1e794d2af6d&X-Amz-SignedHeaders=host&response-content-disposition=inline&x-amz-checksum-mode=ENABLED&x-id=GetObject",
  ];

  const toggleTheme = () => {
    setMode(mode === Mode.ADVANCED ? Mode.BASIC : Mode.ADVANCED);
  };

  const renderItem = ({ item }: { item: string }) => (
    <Box padding="s">
      <Image 
        source={{ uri: item }} 
        style={{ 
          width: width - 32, // Full width minus padding
          height: 200,
          borderRadius: 8
        }} 
      />
    </Box>
  );

  return (
    <Box backgroundColor="primary" flex={1}>
      <Box paddingVertical="m">
        <Button label="Toggle Mode" onPress={toggleTheme} />
        <Button label="Login" onPress={() => router.push("/(auth)/login")} />
        <Button label="Register" onPress={() => router.push("/(auth)/register")} />
      </Box>
      
      <FlashList
        data={images}
        renderItem={renderItem}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </Box>
  );
};

export default Index;