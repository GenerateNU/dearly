/**
 * Takes in audioLevels and outputs the visual representation of them. If there are not enough
 * audioLevels to have the given number of lines it will buffer the front with a default value of
 * 3. If there are more than the num lines it will take the last numLines number of audioLevels to
 * represent.
 * @param numLines - number of lines for the representations
 * @param audioLevels - the audio levels to be represented
 * @returns an array of numbers representing the heights of the bars in a visual representation of audio
 */
export const audioBarHeights = (numLines: number, audioLevels: number[]): number[] => {
  let start = 0;
  if (audioLevels.length > numLines) {
    start = audioLevels.length - numLines;
  }
  const newLines = normalizeLines(audioLevels, start, audioLevels.length);
  let length = newLines.length;
  for (let i = 0; i < numLines - length; i++) {
    newLines.unshift(3);
  }
  return newLines;
};

/**
 * Condenses the given audioLevels into a visual representation of audio. It will average
 * chunks so that the resulting array has numLines elements and represents the entire original
 * audio array.
 * @param numLines the number of entries in the resulting array
 * @param audioLevels the audio levels to be represented
 * @returns an array representing the height of the audio levels in the visual representation
 */
export const condenseAudioBarHeights = (numLines: number, audioLevels: number[]): number[] => {
  if (audioLevels.length <= numLines) {
    return normalizeLines(audioLevels, 0, audioLevels.length);
  }
  const ratio = audioLevels.length / numLines;
  const compressedLines: number[] = [];
  for (let i = 0; i < numLines; i++) {
    const start = Math.floor(i * ratio);
    const end = start + ratio;
    const chunk = audioLevels.slice(start, end);
    const avg = chunk.reduce((acc, val) => acc + val, 0) / chunk.length;
    compressedLines.push(avg);
  }
  return normalizeLines(compressedLines, 0, compressedLines.length);
};

/**
 * Normalizes an array of audio levels so each entry is between the start and end number
 * @param audioLevels the array of audio levels to be normalized
 * @param start the start numer
 * @param end the end number
 * @returns a normalized array of audio levels where each element is between the start and end
 */
const normalizeLines = (audioLevels: number[], start: number, end: number): number[] => {
  const newLines: number[] = [];
  for (let i = start; i < end; i++) {
    const reverseNum = 160 - Math.abs(audioLevels[i] || 3);
    const squaredNum = Math.pow(reverseNum, 2);
    let scaledNum = (squaredNum / 25600) * 25;
    scaledNum = scaledNum > 3 ? scaledNum : 3;
    newLines.push(scaledNum);
  }
  return newLines;
};

/**
 * Converts an array of amplitude data to an array of db levels
 * @param data the array of amplitude data to be converted
 * @returns an array of db levels
 */
export const getDBLevels = (data: Float32Array): number[] => {
  const dbLevels: number[] = [];
  dbLevels.forEach((amplitude) => {
    if ((amplitude = 0)) {
      dbLevels.push(0);
    } else if (amplitude < 0.000000001) {
      dbLevels.push(20 * Math.log10(Math.abs(0.000000001)));
    } else {
      dbLevels.push(20 * Math.log10(Math.abs(amplitude)));
    }
  });
  return condenseAudioBarHeights(25, dbLevels);
};
