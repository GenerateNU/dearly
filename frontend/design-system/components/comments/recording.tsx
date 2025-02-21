import React, { memo, useEffect, useState } from "react";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/design-system/base/theme";
import { AVPlaybackStatus, Audio } from 'expo-av';
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "../ui/icon-button";
import { MaterialIcon } from "@/types/icon";
import { formatSeconds } from "@/utilities/time";
import { audioBarHeights, condenseAudioBarHeights } from "@/utilities/audio";

interface RecordingProps {
    onClose: () => void;
}

export const Recording: React.FC<RecordingProps> = ({onClose}) => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [sound, setSound] = useState<Audio.Sound>();
    const [doneRecording, setDoneRecording] = useState<boolean>(false);
    const [playingSound, setPlayingSound] = useState<boolean>(false);
    const [uri, setURI] = useState<string>("");
    const [recording, setRecording] = useState<Audio.Recording | null>();
    const [audioLevels, setAudioLevels] = useState<number[]>([]);
    const [length, setLength] = useState<number>(0);
    const [stringLength, setStringLength] = useState<string>("");
    const [memoLines, setMemoLines] = useState<number[]>(new Array(50).fill(5));
    const numLines = 33;
    const [totalLength, setTotalLength] = useState<number>(0);

    // get length of recording
    useEffect(() => {
        setStringLength(formatSeconds(length))
    }, [length]);

    useEffect(() => {
        if(isRecording){
            setMemoLines(audioBarHeights(numLines, audioLevels))
        }
    }, [audioLevels])

    useEffect(() => {
        return sound
          ? () => {
              sound.unloadAsync();
            }
          : undefined;
      }, [sound]);

  
    async function startRecording() {
        setLength(0);
        setDoneRecording(false)
        setAudioLevels([])
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
          setIsRecording(true);
          const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY,
            (status) => {
              setAudioLevels(prevAudioLevels => {
                const curAudio = [...prevAudioLevels];
                if(status.metering !== undefined){
                  curAudio.push(status.metering)
                }
                return curAudio;
              });
              if(status.durationMillis > 0){
                setLength(status.durationMillis / 1000);
              }
            }, 
            500
          );
          setRecording(recording);
        } catch (err) {
        }
    }
    
    async function stopRecording() {
        setTotalLength(length)
        setIsRecording(false);
        setDoneRecording(true);
        await recording?.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
          {
            allowsRecordingIOS: false,
          }
        );
        setMemoLines(condenseAudioBarHeights(25, audioLevels));
        console.log(doneRecording)
        const uri = recording?.getURI();
        setURI(uri || "");
    }

    async function playRecording() {
        if(playingSound){
            await sound?.playAsync()
        }   
        else{
            setPlayingSound(true)
            const { sound } = await Audio.Sound.createAsync({uri});
            sound.setOnPlaybackStatusUpdate(onPlayingUpdate)
            sound.setProgressUpdateIntervalAsync(500)
            setSound(sound);
            await sound.playAsync();
        }
    }

    async function pauseRecording() {
        await sound?.pauseAsync()
        setPlayingSound(false)
    }

    const onPlayingUpdate = (status: AVPlaybackStatus) => {
        if(status.isLoaded){
        if(status.positionMillis < status.durationMillis!) 
            setLength((status.durationMillis || 0 ) / 1000 - status.positionMillis / 1000)
            else{
                setLength(status.durationMillis! / 1000)
                setPlayingSound(false);
            }
        }
    }
    return (
        <Box gap="s" flexDirection="row" justifyContent="center" height={50} borderRadius="l" >
            {doneRecording && (
                <Box> 
                    <IconButton variant="iconGray" onPress={onClose} icon="close" />
                </Box>
            )
            }
            <Box backgroundColor="gray" paddingLeft ="xs" gap = "s" width= {doneRecording? "70%" : "80%"} height={50} borderRadius="l" flexDirection="row" alignContent="center" >
                {doneRecording &&  (playingSound? <IconButton variant="iconPearl" onPress={pauseRecording} icon="pause"/>  :  <IconButton variant="iconPearl" onPress={playRecording} icon="play" />)}
             
                <Box flexDirection="row" gap="xs" alignItems="center">
                    <Box flexDirection="row" gap="xs" alignItems="center">
                        {!doneRecording &&
                        <Box borderRadius="xl" width={8} height={8} backgroundColor= {isRecording? "blush" : "darkGray"} marginLeft="m"> 
                        </Box> }
                        <Text variant="caption">{stringLength}</Text>
                    </Box>
                    {(isRecording || doneRecording ) &&
                    <Box flexDirection="row" gap="xs" alignItems="center">
                        {memoLines.map((item, index) =>
                            <Box key = {index} height={item} width={2} backgroundColor= {doneRecording? (index < (memoLines.length / totalLength) * (totalLength - length) )? "ink" : "darkGray" : "ink"} borderRadius="l"> 
                            </Box>
                        )}
                    </Box>}
                </Box>
            </Box>

            {isRecording? 
            <IconButton variant="iconGray" onPress={stopRecording}  icon="square-rounded" /> : 
            doneRecording? <IconButton variant="iconGray" onPress={startRecording}  icon="send"/> 
            : <IconButton variant="iconGray" onPress={startRecording} icon="circle" />
            }
        </Box>
    )
}