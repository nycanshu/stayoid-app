/**
 * Linear blend between two #RRGGBB colors. Use this to compute outline / divider
 * colors that are guaranteed visible against any base color, on either theme.
 *
 *   blend(colors.foreground, colors.card, 0.20)
 *
 * → 20% foreground mixed into the card color → produces a visible outline on
 *   the card (light gray on dark cards, mid gray on light cards).
 */
export function blend(hexA: string, hexB: string, t: number): string {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  const r  = Math.round(a.r + (b.r - a.r) * (1 - t));
  const g  = Math.round(a.g + (b.g - a.g) * (1 - t));
  const bl = Math.round(a.b + (b.b - a.b) * (1 - t));
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

function parseHex(h: string) {
  const v = h.replace('#', '');
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function toHex(n: number) {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
}
