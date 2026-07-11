const AVERAGE_CHAR_WIDTH_RATIO = 0.55;

export function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * AVERAGE_CHAR_WIDTH_RATIO;
}
