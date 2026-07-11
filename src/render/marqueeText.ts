import { escapeXml } from './escapeXml';
import { estimateTextWidth } from './textWidth';

export function renderScrollingText(
  text: string,
  x: number,
  y: number,
  availableWidth: number,
  fontSize: number,
  fontWeight: number,
  color: string,
  clipId: string,
  animationDelay: number
): string {
  const escaped = escapeXml(text);
  const textElement = `<text x="0" y="0" font-family="Poppins, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}">${escaped}</text>`;
  const textWidth = estimateTextWidth(text, fontSize);
  const overflow = textWidth - availableWidth;

  if (overflow <= 0) {
    return `<g transform="translate(${x}, ${y})">${textElement}</g>`;
  }

  const scrollDistance = overflow + 4;
  return `<clipPath id="${clipId}"><rect x="0" y="${-fontSize}" width="${availableWidth}" height="${fontSize * 1.4}" /></clipPath>
  <g transform="translate(${x}, ${y})" clip-path="url(#${clipId})">
    <g>
      ${textElement}
      <animateTransform attributeName="transform" type="translate"
        values="0,0; 0,0; -${scrollDistance},0; -${scrollDistance},0; 0,0"
        keyTimes="0; 0.1; 0.5; 0.6; 1"
        dur="15s" begin="${animationDelay}s" repeatCount="indefinite" calcMode="linear" />
    </g>
  </g>`;
}
