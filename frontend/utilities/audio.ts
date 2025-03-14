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


