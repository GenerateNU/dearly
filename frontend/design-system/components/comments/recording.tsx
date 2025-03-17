import React, { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "../ui/icon-button";
import { formatSeconds } from "@/utilities/time";
import { audioBarHeights, condenseAudioBarHeights } from "@/utilities/audio";
import { Playback } from "./playback";
import { recordingAttributes, recordingStatus } from "@/types/comment";

interface RecordingProps {
  onClose: () => void;
  onSend: (uri: string) => void;
}

export const Recording: React.FC<RecordingProps> = ({ onClose, onSend }) => {
  const [status, setStatus] = useState<recordingStatus>({recording:false, done:false})
  const [attributes, setAttributes] = useState<recordingAttributes>({recording:null, audioLevels:[], length:0, memoLines:new Array(50).fill(5), uri:""})
  const numLines = 33;

  useEffect(() => {
    if (status.recording) {
      setAttributes((prevAttributes) => ({
        ...prevAttributes, 
        memoLines:audioBarHeights(numLines, attributes.audioLevels)
      }));
    }
  }, [attributes.audioLevels]);

  async function startRecording() {
    setAttributes((prevAttributes) => ({
      ...prevAttributes, 
      length: 0, 
      audioLevels: []
    }))
    setStatus({...status, done:false})
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      setStatus({...status, recording:true})
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          setAttributes((prevAttributes) => {
            const curAudio = [...prevAttributes.audioLevels];
            if (status.metering !== undefined) {
              curAudio.push(status.metering);
            }
            return {...prevAttributes, audioLevels:curAudio}
          })
          if (status.durationMillis > 0) {
            setAttributes((prevAttributes) => ({
              ...prevAttributes, 
              length: status.durationMillis / 1000
            }));
          }
        },
        500,
      );
      setAttributes((prevAttributes) => ({
        ...prevAttributes, 
        recording:recording
      }));
    } catch (err) {}
  }

  async function stopRecording() {
    setStatus({recording:false, done:true})
    await attributes.recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    setAttributes((prevAttributes) => ({
      ...prevAttributes, 
      memoLines:condenseAudioBarHeights(25, attributes.audioLevels),
      uri: attributes.recording?.getURI() || ""
    }));
  }

  return (
    <Box gap="s" flexDirection="row" justifyContent="center" height={50} borderRadius="l">
      {status.done && (
        <Box>
          <IconButton variant="iconBlush" onPress={onClose} icon="close" />
        </Box>
      )}
      {status.done ? (
        <Playback local dbLevels={attributes.memoLines} location={attributes.uri} audioLength={attributes.length} />
      ) : (
        <Box
          borderWidth={1}
          borderColor="ink"
          backgroundColor="pearl"
          paddingLeft="xs"
          gap="s"
          width={status.done ? "70%" : "80%"}
          height={50}
          borderRadius="l"
          flexDirection="row"
          alignContent="center"
        >
          <Box flexDirection="row" gap="xs" alignItems="center">
            <Box flexDirection="row" gap="xs" alignItems="center" marginLeft="s">
              <Text variant="caption">{formatSeconds(attributes.length)}</Text>
            </Box>

            {status.recording && (
              <Box flexDirection="row" gap="xs" alignItems="center">
                {attributes.memoLines.map((item, index) => (
                  <Box
                    key={index}
                    height={item}
                    width={2}
                    backgroundColor="ink"
                    borderRadius="l"
                  ></Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {status.recording ? (
        <IconButton variant="iconHoney" onPress={stopRecording} icon="square-rounded" />
      ) : status.done ? (
        <IconButton
          variant="iconHoney"
          onPress={() => {
            setStatus({recording:false, done:false})
            setAttributes({...attributes, length:0})
          }}
          icon="send"
        />
      ) : (
        <IconButton variant="iconHoney" onPress={startRecording} icon="circle" />
      )}
    </Box>
  );
};
