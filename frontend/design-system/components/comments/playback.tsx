import React, { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "../ui/icon-button";
import { formatSeconds } from "@/utilities/time";
import { audioBarHeights, condenseAudioBarHeights, getDBLevels } from "@/utilities/audio";
import decode, { decoders } from "audio-decode";
import { playbackStates } from "@/types/comment";

interface PlaybackPropsWhenLocal {
  local: true; // is the audio message being stored locally or in s3
  dbLevels: number[];
  audioLength: number;
  location: string;
}

interface PlaybackPropsWhenURL {
  local: false;
  location: string;
  dbLevels?: number[];
  audioLength?: number;
}

type PlaybackProps = PlaybackPropsWhenLocal | PlaybackPropsWhenURL;

export const Playback: React.FC<PlaybackProps> = ({ local, dbLevels, audioLength, location }) => {
  const [status, setStatus] = useState<playbackStates>({playing:false, pausing:false});
  const [sound, setSound] = useState<Audio.Sound>();
  const [length, setLength] = useState<number>(0);
  const [memoLines, setMemoLines] = useState<number[]>([]);
  const numLines = 25;
  const [totalLength, setTotalLength] = useState<number>(0);

  useEffect(() => {
    async function initializeValues() {
      if (local) {
        setMemoLines(condenseAudioBarHeights(numLines, dbLevels));
        setLength(audioLength);
        setTotalLength(audioLength);
      } else {
        const response = await fetch(location); // initally fetch the mp3 file
        const arrayBuffer = await response.arrayBuffer(); // convert to array buffer
        const uint8Array = new Uint8Array(arrayBuffer); // convert to unit8Array
        const audioBuffer = await decoders.mp3(uint8Array); // get AudioBuffer format
        const channelData = audioBuffer.getChannelData(0); // get the channel data which is the amplitude

        setMemoLines(getDBLevels(channelData));
        setLength(audioBuffer.duration);
        setTotalLength(audioBuffer.duration);
      }
    }
    initializeValues();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playRecording() {
    if (status.pausing) {
      setStatus({playing:true, pausing:false})
      await sound?.playAsync();
    } else {
      setStatus({...status, playing:true})
      const { sound } = await Audio.Sound.createAsync({ uri: location });
      sound.setOnPlaybackStatusUpdate(onPlayingUpdate);
      sound.setProgressUpdateIntervalAsync(500);
      setSound(sound);
      await sound.playAsync();
    }
  }

  async function pauseRecording() {
    await sound?.pauseAsync();
    setStatus({playing:false, pausing:true})
  }

  const onPlayingUpdate = (statusPlayback: AVPlaybackStatus) => {
    if (statusPlayback.isLoaded) {
      if (statusPlayback.positionMillis < statusPlayback.durationMillis!)
        setLength((statusPlayback.durationMillis || 0) / 1000 - statusPlayback.positionMillis / 1000);
      else {
        setLength(statusPlayback.durationMillis! / 1000);
        setStatus({...status, playing:false})
      }
    }
  };
  return (
    <Box
      borderWidth={1}
      borderColor="ink"
      backgroundColor="pearl"
      paddingLeft="xs"
      gap="s"
      width="70%"
      height={50}
      borderRadius="l"
      flexDirection="row"
      alignContent="center"
    >
      <Box alignItems="center" justifyContent="center" paddingLeft="s">
        {status.playing ? (
          <IconButton
            variant="smallIconPearlBorder"
            onPress={pauseRecording}
            icon="pause"
            size={20}
          />
        ) : (
          <IconButton
            variant="smallIconPearlBorder"
            onPress={playRecording}
            icon="play"
            size={20}
          />
        )}
      </Box>
      <Box flexDirection="row" gap="xs" alignItems="center">
        <Box flexDirection="row" gap="xs" alignItems="center">
          <Text variant="caption">{formatSeconds(length)}</Text>
        </Box>
        <Box flexDirection="row" gap="xs" alignItems="center">
          {memoLines.map((item, index) => (
            <Box
              key={index}
              height={item}
              width={2}
              backgroundColor={
                index < (memoLines.length / totalLength) * (totalLength - length)
                  ? "ink"
                  : "darkGray"
              }
              borderRadius="l"
            ></Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
