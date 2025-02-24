import React, {useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from 'expo-av';
import { Box } from "@/design-system/base/box";
import { Text } from "@/design-system/base/text";
import { IconButton } from "../ui/icon-button";
import { formatSeconds } from "@/utilities/time";
import { audioBarHeights, condenseAudioBarHeights } from "@/utilities/audio";

interface RecordingProps {
    onClose: () => void;
    onSend: (uri:string) => void;
}

export const Recording: React.FC<RecordingProps> = ({onClose, onSend}) => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [sound, setSound] = useState<Audio.Sound>();
    const [doneRecording, setDoneRecording] = useState<boolean>(false);
    const [playingSound, setPlayingSound] = useState<boolean>(false);
    const [pausing, setPausing] = useState<boolean>(false);
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
        const uri = recording?.getURI();
        setURI(uri || "");
    }

    async function playRecording() {
        if(pausing){
            setPausing(false)
            setPlayingSound(true)
            await sound?.playAsync()
        }   
        else {
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
        setPausing(true)
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
                    <IconButton variant="iconBlush" onPress={onClose} icon="close" />
                </Box>
            )
            }
            <Box borderWidth={1}borderColor = "ink" backgroundColor="pearl" paddingLeft ="xs" gap = "s" width= {doneRecording? "70%" : "80%"} height={50} borderRadius="l" flexDirection="row" alignContent="center" >
                {doneRecording && 
                <Box alignItems="center" justifyContent="center" paddingLeft="s"> 
                    {playingSound? <IconButton variant="smallIconPearlBorder" onPress={pauseRecording} icon="pause" size={20}/>  :  <IconButton variant="smallIconPearlBorder" onPress={playRecording} icon="play" size={20}/> } 
                </Box>}
             
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
            <IconButton variant="iconHoney" onPress={stopRecording}  icon="square-rounded" /> : 
            doneRecording? <IconButton variant="iconHoney" onPress={() =>{ setIsRecording(false); setDoneRecording(false); setLength(0)}}  icon="send"/> 
            : <IconButton variant="iconHoney" onPress={startRecording} icon="circle" />
            }
        </Box>
    )
}