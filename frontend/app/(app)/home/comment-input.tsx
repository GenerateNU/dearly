import Input from "@/design-system/components/shared/controls/input";
import { Icon } from "@/design-system/components/shared/icons/icon";
import React, { useState } from "react";
import MultitrackAudio from "@/assets/audio.svg"
import { Recording } from "@/design-system/components/comments/recording";
import { Box } from "@/design-system/base/box";
import { CommentPopUp } from "@/design-system/components/comments/comment-popup";


interface Props {
    onPress: () => void;
}

export const CommentInput: React.FC<Props> = ({onPress})=> {
    const [recording, setRecording] = useState<boolean>(false);
    const sendComment = (uri : string) => {
    }

    return (
        <Box>
            {recording ?  
            <Recording onSend={sendComment} onClose={() => setRecording(false)} />
            :
            <Input onPress={onPress} isButton placeholder="Write or record a message..." rightIcon={<MultitrackAudio onPress={() => setRecording(true)}/>}/>
            } 
        </Box>
    )

}