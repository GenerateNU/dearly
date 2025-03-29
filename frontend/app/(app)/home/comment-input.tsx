import Input from "@/design-system/components/shared/controls/input";
import React, { useState, useEffect } from "react";
import MultitrackAudio from "@/assets/audio.svg";
import { Recording } from "@/design-system/components/comments/recording";
import { Box } from "@/design-system/base/box";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { useCreateComment } from "@/hooks/api/post";
import * as FileSystem from "expo-file-system";
import { useUserStore } from "@/auth/store";
import { useUploadGroupMedia } from "@/hooks/api/media";
import { Alert } from "react-native";

interface Props {
  onPress?: () => void;
  isButton?: boolean;
  postID: string;
}

export const CommentInput: React.FC<Props> = ({ postID }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const { group } = useUserStore();

  const {
    mutateAsync: uploadMedia,
    error: mediaError,
    isError: isMediaError,
    isPending: mediaPending,
  } = useUploadGroupMedia(group?.id as string);

  const {
    mutateAsync: createComment,
    error: createPostError,
    isError: isCreatePostError,
    isPending: commentPending,
  } = useCreateComment(postID, group?.id as string);

  // Show error alerts when errors occur
  useEffect(() => {
    if (isMediaError && mediaError) {
      Alert.alert("Upload Error", "Failed to upload audio recording. Please try again.", [
        { text: "OK" },
      ]);
    }
  }, [isMediaError, mediaError]);

  useEffect(() => {
    if (isCreatePostError && createPostError) {
      Alert.alert("Comment Error", "Failed to post your comment. Please try again.", [
        { text: "OK" },
      ]);
    }
  }, [isCreatePostError, createPostError]);

  const sendRecording = async (uri: string) => {
    try {
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const formData = new FormData();

      formData.append("media", {
        uri: `data:audio/aac;base64,${base64Audio}`,
        name: "recording.m4a",
        type: "audio/aac",
      } as any);

      const keys = await uploadMedia(formData);

      if (keys[0]) {
        await createComment({
          voiceMemo: keys[0].objectKey,
        });
      }
      setRecording(false);
    } catch (error) {
      console.error("Error", error);
      Alert.alert("Error", "Something went wrong while sending your recording. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const sendComment = async () => {
    if (!text.trim()) return;

    try {
      await createComment({
        content: text,
      });
      setText("");
    } catch (error) {
      console.error("Error", error);
      Alert.alert("Error", "Something went wrong while sending your comment. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  return (
    <Box>
      {recording && <Recording onSend={sendRecording} onClose={() => setRecording(false)} />}
      <Box
        position={recording ? "absolute" : "relative"}
        top={recording ? -1000 : "auto"}
        right={recording ? -100000 : "auto"}
        paddingTop="xs"
        paddingBottom="s"
      >
        <Input
          autoFocus
          placeholder="Write or record a message..."
          value={text}
          onChangeText={(input: string) => setText(input)}
          rightIcon={
            text === "" ? (
              <MultitrackAudio onPress={() => !mediaPending && setRecording(true)} />
            ) : (
              <Icon
                onPress={sendComment}
                name="send"
                color={commentPending ? "gray" : "slate"}
                size={30}
              />
            )
          }
        />
      </Box>
    </Box>
  );
};

export default CommentInput;
