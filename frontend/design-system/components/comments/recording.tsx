import React, { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "../shared/buttons/icon-button";
import { formatSeconds } from "@/utilities/time";
import { audioBarHeights, condenseAudioBarHeights } from "@/utilities/audio";
import { Playback } from "./playback";
import { recordingAttributes, recordingStatus } from "@/types/comment";
import { Icon } from "../shared/icons/icon";

interface RecordingProps {
  onClose: () => void;
  onSend: (uri: string) => void;
}

export const Recording: React.FC<RecordingProps> = ({ onClose, onSend }) => {
  const numLines = 36;
  const [status, setStatus] = useState<recordingStatus>({ recording: true, done: false });
  const [attributes, setAttributes] = useState<recordingAttributes>({
    recording: null,
    audioLevels: [],
    length: 0,
    memoLines: new Array(numLines).fill(5),
    uri: "",
  });
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    if (status.recording) {
      setAttributes((prevAttributes) => ({
        ...prevAttributes,
        memoLines: audioBarHeights(numLines, attributes.audioLevels),
      }));
    }
  }, [attributes.audioLevels]);

  async function startRecording() {
    setAttributes((prevAttributes) => ({
      ...prevAttributes,
      length: 0,
      audioLevels: [],
    }));
    setStatus({ ...status, done: false });
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      setStatus({ ...status, recording: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          setAttributes((prevAttributes) => {
            const curAudio = [...prevAttributes.audioLevels];
            if (status.metering !== undefined) {
              curAudio.push(status.metering);
            }
            return { ...prevAttributes, audioLevels: curAudio };
          });
          if (status.durationMillis > 0) {
            setAttributes((prevAttributes) => ({
              ...prevAttributes,
              length: status.durationMillis / 1000,
            }));
          }
        },
        500,
      );
      setAttributes((prevAttributes) => ({
        ...prevAttributes,
        recording: recording,
      }));
    } catch {}
  }

  async function stopRecording() {
    setStatus({ recording: false, done: true });
    await attributes.recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    setAttributes((prevAttributes) => ({
      ...prevAttributes,
      memoLines: condenseAudioBarHeights(25, attributes.audioLevels),
      uri: attributes.recording?.getURI() || "",
    }));
  }

  useEffect(() => {
    startRecording();
  }, []);

  return (
    <Box
      gap="s"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      height={50}
      borderRadius="l"
    >
      {status.done && (
        <Box>
          <IconButton variant="iconGray" onPress={onClose} icon="close" size={30} />
        </Box>
      )}
      {status.done ? (
        <Box width="65%">
          <Playback
            local
            dbLevels={attributes.audioLevels}
            location={attributes.uri}
            audioLength={attributes.length}
          />
        </Box>
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
          <Box flexDirection="row" gap="xs" alignItems="center" paddingLeft="s">
            <Text variant="bodyLarge">{formatSeconds(attributes.length)}</Text>

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

      {sending ? (
        <Box width={30} height={30} backgroundColor="honey" borderRadius="xl">
          <Icon name="send" size={30} />{" "}
        </Box>
      ) : status.done ? (
        <IconButton
          variant="icon"
          onPress={() => {
            setSending(true);
            onSend(attributes.uri);
          }}
          icon="send"
          size={30}
        />
      ) : (
        <IconButton variant="icon" onPress={stopRecording} icon="square-rounded" size={30} />
      )}
    </Box>
  );
};
