import React, { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "../shared/buttons/icon-button";
import { formatSeconds } from "@/utilities/time";
import { condenseAudioBarHeights} from "@/utilities/audio";
import { playbackStates } from "@/types/comment";
import * as FileSystem from "expo-file-system";
import { useProcessAudio } from "@/hooks/api/media";
import { Icon } from "../shared/icons/icon";


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
  const [status, setStatus] = useState<playbackStates>({ playing: false, pausing: false });
  const [sound, setSound] = useState<Audio.Sound>();
  const [length, setLength] = useState<number>(0);
  const [uri, setUri] = useState<string>("");
  const [memoLines, setMemoLines] = useState<number[]>([]);
  const numLines = 23;
  const [totalLength, setTotalLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const baseAudio = [3, 3, 3, 20, 30, 40, 50, 50, 50, 50, 90, 80, 70, 10, 10, 10]
  const {
    mutateAsync: processAudio,
    error: mediaError,
  } = useProcessAudio();

  const uniqueFilename = `temp-audio-${new Date().getTime()}-${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    async function initializeValues() {
      if (local) {
        setMemoLines(condenseAudioBarHeights(numLines, dbLevels));
        setLength(audioLength);
        setTotalLength(audioLength);
        setUri(location)
      } else {
        const downloadResult = await FileSystem.downloadAsync(
          location,
          FileSystem.documentDirectory + uniqueFilename + "temp-audio.mp3",
        );
        const localUri = downloadResult.uri;
        setUri(localUri);
        const response = await processAudio({url: location});
        if(mediaError){
          setMemoLines(condenseAudioBarHeights(25, baseAudio, 160))
        }
        setLength(response.length)
        setTotalLength(response.length)
        setMemoLines(condenseAudioBarHeights(25, response.data, 70))
      }
    }
    initializeValues();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          FileSystem.deleteAsync(uri, { idempotent: true })
          .catch();
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
      const { sound } = await Audio.Sound.createAsync({ uri: local ? location : uri });
      sound.setOnPlaybackStatusUpdate(onPlayingUpdate);
      sound.setProgressUpdateIntervalAsync(500);
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
        setLength(statusPlayback.durationMillis! / 1000);
        setStatus({ ...status, playing: false });
      }
    } else{
      setLoading(true)
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
              index < (memoLines.length / totalLength) * (totalLength - length) ? "ink" : "darkGray"
            }
            borderRadius="l"
          ></Box>
        ))}
      </Box>
      {loading && <Icon  name="loading" size={20} /> }
    </Box>
  );
};
