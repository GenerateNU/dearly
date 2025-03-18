import { Audio } from "expo-av";

export type playbackStates = {
  playing: boolean;
  pausing: boolean;
};

export type recordingStatus = {
  recording: boolean;
  done: boolean;
};

export type recordingAttributes = {
  recording: Audio.Recording | null;
  audioLevels: number[];
  length: number;
  memoLines: number[];
  uri: string;
};
