import Input from "@/design-system/components/shared/controls/input";
import React, { useState, useEffect } from "react";
import MultitrackAudio from "@/assets/audio.svg";
import { Recording } from "@/design-system/components/comments/recording";
import { Box } from "@/design-system/base/box";
import { KeyboardUp } from "@/design-system/components/shared/controls/keyboardup";

interface Props {
  onPress?: () => void;
  isButton?: boolean;
}

export const CommentInput: React.FC<Props> = ({ onPress, isButton = false }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const sendComment = (uri: string) => {};


  return (
    <Box>
          {recording &&
          <Recording onSend={sendComment} 
          onClose={() => 
            setRecording(false)
            } />
          }
          
        <Box position={recording? "absolute" : "relative"} top={recording? -1000 : "auto"} right={recording? -100000 : "auto"}>
          <Input
            placeholder="Write or record a message..."
            rightIcon={<MultitrackAudio onPress={() => setRecording(true)} />}
          />
        </Box>
      
    </Box>
  );
};
