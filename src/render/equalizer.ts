export function renderEqualizerBars(x: number, y: number, height: number, color: string): string {
  const barWidth = 3;
  const gap = 2.5;
  const durations = [1.1, 0.9, 1.3, 1.0, 1.2];
  const minRatios = [0.3, 0.35, 0.5, 0.45, 0.4];
  const maxRatios = [1.0, 0.8, 0.9, 1.0, 0.75];

  return durations
    .map((dur, i) => {
      const barX = x + i * (barWidth + gap);
      const minH = height * minRatios[i];
      const maxH = height * maxRatios[i];
      const minY = y + height - minH;
      const maxY = y + height - maxH;
      return `<rect x="${barX}" y="${maxY}" width="${barWidth}" height="${maxH}" rx="1.5" fill="${color}">
        <animate attributeName="height" values="${minH};${maxH};${minH}" dur="${dur}s" repeatCount="indefinite" />
        <animate attributeName="y" values="${minY};${maxY};${minY}" dur="${dur}s" repeatCount="indefinite" />
      </rect>`;
    })
    .join('\n');
}
