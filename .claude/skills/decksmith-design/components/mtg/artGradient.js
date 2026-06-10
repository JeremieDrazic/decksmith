// artGradient — derives a tasteful, MTG-Arena-style gradient from a deck/card
// color identity, used as a placeholder when real Scryfall artwork isn't
// supplied. Pass an `art` image URL to components to use real art instead.
const STOPS = {
  w: ['#d8cfa0', '#9a8f5e'],
  u: ['#2c7fc4', '#123a63'],
  b: ['#4a3a63', '#160d22'],
  r: ['#c4422a', '#5c1a12'],
  g: ['#2e7d4f', '#0f3a22'],
  c: ['#8fa3b0', '#3a444c'],
};

export function artGradient(colors) {
  const list = (Array.isArray(colors) ? colors : String(colors || '').split(''))
    .map((c) => String(c).toLowerCase())
    .filter((c) => STOPS[c]);
  const keys = list.length ? list : ['c'];
  if (keys.length === 1) {
    const [a, b] = STOPS[keys[0]];
    return `radial-gradient(120% 120% at 30% 20%, ${a}, ${b})`;
  }
  const ramp = keys.map((k, i) => `${STOPS[k][0]} ${Math.round((i / (keys.length - 1)) * 100)}%`);
  return `linear-gradient(135deg, ${ramp.join(', ')})`;
}
