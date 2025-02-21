export const audioBarHeights = (numLines: number, audioLevels: number[]): number[] => {
    let start = 0
    if (audioLevels.length > numLines){
        start = audioLevels.length - numLines
    }
    const newLines = normalizeLines(audioLevels, start, audioLevels.length)
   let length = newLines.length
   for(let i = 0; i < numLines - length; i ++){
    newLines.unshift(3);
   }
   return newLines
}

export const condenseAudioBarHeights = (numLines: number, audioLevels: number[]): number[] => {
    if (audioLevels.length <= numLines) {
        return normalizeLines(audioLevels, 0, audioLevels.length)
    }
      const ratio = audioLevels.length / numLines;
      const compressedLines: number[] = [];
    
      for (let i = 0; i < numLines; i++) {
        const start = Math.floor(i * ratio);
        const end = Math.floor((i + 1) * ratio);
        const chunk = audioLevels.slice(start, end);3
        const avg = chunk.reduce((acc, val) => acc + val, 0) / chunk.length;
        compressedLines.push(avg);
      }
      return normalizeLines(compressedLines, 0, compressedLines.length);
}

const normalizeLines = (audioLevels: number[], start: number, end:number): number[] => {
    const newLines = []
        for(let i = start; i < end; i ++){
            const reverseNum = 160 - Math.abs(audioLevels[i] || 3)
            newLines.push(( reverseNum / (160 - 20)) * 20)
       }
    return newLines;

}