import React, { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "../ui/icon-button";
import { formatSeconds } from "@/utilities/time";
import { audioBarHeights, condenseAudioBarHeights, getDBLevels } from "@/utilities/audio";
import decode, { decoders } from "audio-decode";

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
  const [playingSound, setPlayingSound] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound>();
  const [pausing, setPausing] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>();
  const [stringLength, setStringLength] = useState<string>("");
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
        console.log(memoLines)
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

  // get length of recording
  useEffect(() => {
    setStringLength(formatSeconds(length));
  }, [length]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playRecording() {
    if (pausing) {
      setPausing(false);
      setPlayingSound(true);
      await sound?.playAsync();
    } else {
      setPlayingSound(true);
      const { sound } = await Audio.Sound.createAsync({ uri: location });
      sound.setOnPlaybackStatusUpdate(onPlayingUpdate);
      sound.setProgressUpdateIntervalAsync(500);
      setSound(sound);
      await sound.playAsync();
    }
  }

  async function pauseRecording() {
    await sound?.pauseAsync();
    setPlayingSound(false);
    setPausing(true);
  }

  const onPlayingUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.positionMillis < status.durationMillis!)
        setLength((status.durationMillis || 0) / 1000 - status.positionMillis / 1000);
      else {
        setLength(status.durationMillis! / 1000);
        setPlayingSound(false);
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
        {playingSound ? (
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
          <Text variant="caption">{stringLength}</Text>
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
