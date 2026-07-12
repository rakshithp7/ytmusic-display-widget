const HEIGHT_RATIOS = [
  0.3, 0.55, 0.8, 0.45, 0.9, 0.35, 0.6, 1.0, 0.5, 0.7, 0.25, 0.65, 0.85, 0.4, 0.75, 0.6, 0.3, 0.5, 0.8, 0.4,
];

export function renderWaveform(x: number, y: number, width: number, height: number, color: string): string {
  const barWidth = 4;
  const gap = 3;
  const count = Math.max(0, Math.floor(width / (barWidth + gap)));

  let bars = '';
  for (let i = 0; i < count; i++) {
    const ratio = HEIGHT_RATIOS[i % HEIGHT_RATIOS.length];
    const barHeight = Math.max(barWidth, height * ratio);
    const minHeight = barHeight * 0.35;
    const barX = x + i * (barWidth + gap);
    const barY = y + (height - barHeight);
    const restY = y + (height - minHeight);
    const dur = (0.9 + (i % 5) * 0.15).toFixed(2);
    const delay = (i * 0.08).toFixed(2);

    bars += `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${barWidth / 2}" fill="${color}" opacity="0.9">
      <animate attributeName="height" values="${minHeight};${barHeight};${minHeight}" dur="${dur}s" repeatCount="indefinite" begin="-${delay}s" />
      <animate attributeName="y" values="${restY};${barY};${restY}" dur="${dur}s" repeatCount="indefinite" begin="-${delay}s" />
    </rect>`;
  }
  return bars;
}
