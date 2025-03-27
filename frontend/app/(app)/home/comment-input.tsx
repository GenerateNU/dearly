import Input from "@/design-system/components/shared/controls/input";
import React, { useState, useEffect } from "react";
import MultitrackAudio from "@/assets/audio.svg";
import { Recording } from "@/design-system/components/comments/recording";
import { Box } from "@/design-system/base/box";
import { Icon } from "@/design-system/components/shared/icons/icon";
import { useCreateComment } from "@/hooks/api/post";
import * as FileSystem from 'expo-file-system';
import { useUserStore } from "@/auth/store";
import { useUploadGroupMedia } from "@/hooks/api/media";
import { Buffer } from "buffer";

interface Props {
  onPress?: () => void;
  isButton?: boolean;
  postID: string;
}

export const CommentInput: React.FC<Props> = ({ onPress, isButton = false, postID }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const { group} = useUserStore();

  const {
    mutateAsync: uploadMedia,
    isPending: isPendingMedia,
    error: mediaError,
  } = useUploadGroupMedia(group.id);

  const {
    mutateAsync: createPost,
    isPending: isPendingCreatePost,
    error: createPostError,
  } = useCreateComment(postID, group.id);


  const sendRecording = async (uri: string) => {
    try {
    
      const response = await fetch(uri);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("media", blob, "audio.m4a");

      const keys = await uploadMedia(formData);
      console.log("hey!")
      await createPost({
        voiceMemo: keys[0],
      })
      console.log(createPostError)
      setRecording(false)
    } catch (error) {
      console.error('Error', error);
    }
    

  };

  
  const sendComment = async () => {
    await createPost({
      content: text,
    })
    console.log(createPostError)
    setText("")

  };

  return (
    <Box backgroundColor="pearl">
      {recording && <Recording onSend={sendRecording} onClose={() => setRecording(false)} />}

      <Box
        position={recording ? "absolute" : "relative"}
        top={recording ? -1000 : "auto"}
        right={recording ? -100000 : "auto"}
      >
        <Input
          placeholder="Write or record a message..."
          value={text}
          onChangeText={(input:string) => setText(input)}
          rightIcon={
            text == "" ? (
              <MultitrackAudio onPress={() => setRecording(true)} />
            ) : (
              <Icon onPress={sendComment} name="send" color="slate" size={30} />
            )
          }
        />
      </Box>
    </Box>
  );
};

export default CommentInput;
