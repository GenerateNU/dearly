import React, { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "../shared/buttons/icon-button";
import { formatSeconds } from "@/utilities/time";
import { condenseAudioBarHeights, normalizeLinesWithScale } from "@/utilities/audio";
import { playbackStates } from "@/types/comment";
import * as FileSystem from "expo-file-system";
import { useProcessAudio } from "@/hooks/api/media";

interface PlaybackPropsWhenLocal {
  id?: string;
  local: true; // is the audio message being stored locally or in s3
  dbLevels: number[];
  audioLength: number;
  location: string;
}

interface PlaybackPropsWhenURL {
  id: string;
  local: false;
  location: string;
  dbLevels?: number[];
  audioLength?: number;
}

type PlaybackProps = PlaybackPropsWhenLocal | PlaybackPropsWhenURL;

export const Playback: React.FC<PlaybackProps> = ({
  id,
  local,
  dbLevels,
  audioLength,
  location,
}) => {
  const [status, setStatus] = useState<playbackStates>({ playing: false, pausing: false });
  const [sound, setSound] = useState<Audio.Sound>();
  const [length, setLength] = useState<number>(0);
  const [uri, setUri] = useState<string>("");
  const [memoLines, setMemoLines] = useState<number[]>([]);
  const numLines = 23;
  const [totalLength, setTotalLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { data, isLoading, isPending} = useProcessAudio(id || "", location);

  useEffect(() => {
    async function initializeValues() {
      if (local) {
        setMemoLines(condenseAudioBarHeights(numLines, dbLevels));
        setLength(audioLength);
        setTotalLength(audioLength);
        setUri(location);
      } else {
        const downloadResult = await FileSystem.downloadAsync(
          location,
          FileSystem.documentDirectory + `temp-audio-${id}.mp3`,
        );
        const localUri = downloadResult.uri;
        setUri(localUri);
      }
    }
    initializeValues();
  }, []);

  useEffect(() => {
    return () => {
      FileSystem.deleteAsync(uri, { idempotent: true }).catch();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    setLoading((isLoading || isPending) && !local);
  }, [isLoading, isPending]);

  useEffect(() => {
    if (data) {
      setLength(data.length);
      setTotalLength(data.length);
      setMemoLines(normalizeLinesWithScale(data.data));
    }
  }, [data]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playRecording() {
    if (status.pausing) {
      setStatus({ playing: true, pausing: false });
      await sound?.playAsync();
    } else {
      setStatus({ ...status, playing: true });
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: local ? location : uri });
      sound.setOnPlaybackStatusUpdate(onPlayingUpdate);
      sound.setProgressUpdateIntervalAsync(25);
      setSound(sound);
      await sound.playAsync();
    }
  }

  async function pauseRecording() {
    await sound?.pauseAsync();
    setStatus({ playing: false, pausing: true });
  }

  const onPlayingUpdate = (statusPlayback: AVPlaybackStatus) => {
    if (statusPlayback.isLoaded) {
      if (statusPlayback.positionMillis < statusPlayback.durationMillis!)
        setLength(
          (statusPlayback.durationMillis || 0) / 1000 - statusPlayback.positionMillis / 1000,
        );
      else {
        setLength(totalLength);
        setStatus({ ...status, playing: false });
      }
    }
  };
  return (
    <Box
      borderWidth={1}
      borderColor="ink"
      backgroundColor={local ? "pearl" : "white"}
      paddingLeft="s"
      gap="s"
      width="100%"
      height={local ? 50 : 40}
      borderRadius="l"
      flexDirection="row"
      alignContent="center"
      alignItems="center"
    >
      {status.playing ? (
        <IconButton
          variant="smallIconPearlBorder"
          onPress={pauseRecording}
          icon="pause"
          size={20}
        />
      ) : (
        <IconButton variant="smallIconPearlBorder" onPress={playRecording} icon="play" size={20} />
      )}
      <Text variant="bodyLarge">{formatSeconds(length)}</Text>
      <Box flexDirection="row" gap="xs" alignItems="center">
        {memoLines.map((item, index) => (
          <Box
            key={index}
            height={item}
            width={2}
            backgroundColor={
              index < (memoLines.length / totalLength) * (totalLength - length) ? "honey" : "ink"
            }
            borderRadius="l"
          ></Box>
        ))}
        {loading && <Text variant="body"> loading ... </Text>}
      </Box>
    </Box>
  );
};
