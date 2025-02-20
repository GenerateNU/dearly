import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { ScrollView } from "react-native-gesture-handler";
import { useState } from "react";
import { TextButton } from "@/design-system/components/ui/text-button";
import { RefreshControl } from "react-native";
import { Heart } from "@/design-system/components/posts/heart";
import Input from "@/design-system/components/ui/input";
import { Avatar } from "@/design-system/components/ui/avatar";

const DesignSystem = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        className="flex-1 w-full p-5 bg-white"
      >
        <Box gap="l" paddingBottom="l">
          <Box justifyContent="center">
            <Text paddingBottom="s" variant="bodyLargeBold">
              color palette
            </Text>
            <Box gap="m" flexDirection="row">
              <Box alignItems="center" justifyContent="center" flexDirection="column">
                <Box backgroundColor="honey" width={50} aspectRatio={1} />
                <Text variant="caption">honey</Text>
              </Box>
              <Box alignItems="center" justifyContent="center" flexDirection="column">
                <Box backgroundColor="blush" width={50} aspectRatio={1} />
                <Text variant="caption">blush</Text>
              </Box>
              <Box alignItems="center" justifyContent="center" flexDirection="column">
                <Box backgroundColor="pearl" width={50} aspectRatio={1} />
                <Text variant="caption">pearl</Text>
              </Box>
              <Box alignItems="center" justifyContent="center" flexDirection="column">
                <Box backgroundColor="slate" width={50} aspectRatio={1} />
                <Text variant="caption">slate</Text>
              </Box>
              <Box alignItems="center" justifyContent="center" flexDirection="column">
                <Box backgroundColor="ink" width={50} aspectRatio={1} />
                <Text variant="caption">ink</Text>
              </Box>
            </Box>
          </Box>

          <Box>
            <Text variant="bodyLargeBold">fonts</Text>
            <Text variant="h1">h1</Text>
            <Text variant="h2">h2</Text>
            <Text variant="bodyLargeBold">body large bold</Text>
            <Text variant="bodyLarge">body large</Text>
            <Text variant="button">button</Text>
            <Text variant="body">body</Text>
            <Text variant="caption">caption</Text>
          </Box>

          <Box gap="s" alignItems="flex-start" flexDirection="column">
            <Text variant="bodyLargeBold">buttons</Text>
            <Box gap="xs" flexDirection="row">
              <Box>
                <Heart like={false} onLike={() => null} variant="blush" />
              </Box>
              <Box>
                <Heart like={true} onLike={() => null} variant="honey" />
              </Box>
            </Box>
            <Box flexDirection="row" width="100%">
              <Box gap="xs" width="27%" flexDirection="row">
                <Heart label like={false} onLike={() => null} variant="blush" />
                <Heart label like={true} onLike={() => null} variant="honey" />
              </Box>
            </Box>

            <Box width="100%" gap="s">
              <TextButton variant="blush" label="blush" onPress={() => null} />
              <TextButton variant="blushRounded" label="blush rounded" onPress={() => null} />
              <TextButton variant="honey" label="honey" onPress={() => null} />
              <TextButton variant="honeyRounded" label="honey rounded" onPress={() => null} />
              <TextButton variant="pearl" label="pearl" onPress={() => null} />
              <TextButton variant="pearlRounded" label="pearl rounded" onPress={() => null} />
              <TextButton variant="inkOutline" label="ink outline" onPress={() => null} />
              <TextButton
                variant="inkRoundedOutline"
                label="ink rounded outline"
                onPress={() => null}
              />
            </Box>
          </Box>

          <Box gap="s" flexDirection="column" width="100%">
            <Text variant="bodyLargeBold">text input</Text>
            <Input placeholder="this is a normal textbox" />
            <Input readOnly placeholder="this is a read only textbox" />
            <Input secureTextEntry placeholder="this is secure text, you won't see anything" />
            <Input placeholder="right icon" rightIcon="account-voice" />
            <Input placeholder="left icon" leftIcon="map-marker" />
            <Input
              placeholder="left and right icon"
              leftIcon="camera"
              rightIcon="arrow-down-circle-outline"
            />
            <Input placeholder="big paragraph" paragraph />
            <Input error="some error message here" placeholder="this is an error textbox" />
          </Box>

          <Box flexDirection="column">
            <Text variant="bodyLargeBold">avatar</Text>
            <Box gap="m" flexDirection="row" alignItems="center">
              <Box flexDirection="column" alignItems="center">
                <Avatar
                  variant="big"
                  profilePhoto="https://natureconservancy-h.assetsadobe.com/is/image/content/dam/tnc/nature/en/photos/australia/Quokka_Sam-West.jpg?crop=0%2C886%2C2365%2C1773&wid=640&hei=480&scl=3.6953125"
                />
                <Text variant="caption">big</Text>
              </Box>
              <Box flexDirection="column" alignItems="center">
                <Avatar
                  variant="medium"
                  profilePhoto="https://natureconservancy-h.assetsadobe.com/is/image/content/dam/tnc/nature/en/photos/australia/Quokka_Sam-West.jpg?crop=0%2C886%2C2365%2C1773&wid=640&hei=480&scl=3.6953125"
                />
                <Text variant="caption">medium</Text>
              </Box>
              <Box flexDirection="column" alignItems="center">
                <Avatar
                  variant="small"
                  profilePhoto="https://natureconservancy-h.assetsadobe.com/is/image/content/dam/tnc/nature/en/photos/australia/Quokka_Sam-West.jpg?crop=0%2C886%2C2365%2C1773&wid=640&hei=480&scl=3.6953125"
                />
                <Text variant="caption">small</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </>
  );
};

export default DesignSystem;
