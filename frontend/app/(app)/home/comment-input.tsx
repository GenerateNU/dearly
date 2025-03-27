import Input from "@/design-system/components/shared/controls/input";
import React, { useState, useEffect } from "react";
import MultitrackAudio from "@/assets/audio.svg";
import { Recording } from "@/design-system/components/comments/recording";
import { Box } from "@/design-system/base/box";
import { Icon } from "@/design-system/components/shared/icons/icon";

interface Props {
  onPress?: () => void;
  isButton?: boolean;
}

export const CommentInput: React.FC<Props> = ({ onPress, isButton = false }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const sendRecording = (uri: string) => {};

  const sendComment = () => {};

  return (
    <Box>
      {recording && <Recording onSend={sendRecording} onClose={() => setRecording(false)} />}

      <Box
        position={recording ? "absolute" : "relative"}
        top={recording ? -1000 : "auto"}
        right={recording ? -100000 : "auto"}
      >
        <Input
          placeholder="Write or record a message..."
          onChangeText={setText}
          rightIcon={
            text == "" ? (
              <MultitrackAudio onPress={() => setRecording(true)} />
            ) : (
              <Icon onPress={() => sendComment()} name="send" color="slate" size={30} />
            )
          }
        />
      </Box>
    </Box>
  );
};

export default CommentInput;
