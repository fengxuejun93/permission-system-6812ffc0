/**
 * 生成内置示例图片的 SVG data URI
 * 每张图包含渐变背景 + 装饰图案 + 文字标签
 */
export function generateSampleImageUri(color: string, label: string, pattern: number): string {
  const patterns: Record<number, string> = {
    0: '', // 纯渐变
    1: `<circle cx="60" cy="50" r="25" fill="rgba(255,255,255,0.15)"/><circle cx="100" cy="80" r="18" fill="rgba(255,255,255,0.1)"/>`,
    2: `<rect x="30" y="30" width="60" height="60" rx="8" fill="rgba(255,255,255,0.1)" transform="rotate(15 60 60)"/>`,
    3: `<polygon points="80,20 100,60 60,60" fill="rgba(255,255,255,0.12)"/>`,
    4: `<circle cx="80" cy="70" r="30" fill="rgba(255,255,255,0.08)"/><circle cx="50" cy="40" r="15" fill="rgba(255,255,255,0.1)"/>`,
    5: `<rect x="20" y="70" width="120" height="6" rx="3" fill="rgba(255,255,255,0.12)"/><rect x="40" y="82" width="80" height="6" rx="3" fill="rgba(255,255,255,0.08)"/>`,
  };

  const darkerColor = adjustBrightness(color, -30);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 160 120">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color}"/>
        <stop offset="100%" style="stop-color:${darkerColor}"/>
      </linearGradient>
    </defs>
    <rect width="160" height="120" fill="url(#g)"/>
    ${patterns[pattern] || patterns[0]}
    <text x="80" y="64" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="system-ui,sans-serif" font-size="12" font-weight="500">${label}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
