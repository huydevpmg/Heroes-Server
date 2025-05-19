const PRESET_STYLES = [
  { color: '#FF6B6B', icon: '🔥' },
  { color: '#4ECDC4', icon: '💎' },
  { color: '#FFD93D', icon: '⭐' },
  { color: '#1A8FE3', icon: '📘' },
  { color: '#B980F0', icon: '🎯' },
  { color: '#5FAD56', icon: '🌱' },
  { color: '#FFA36C', icon: '🚀' },
  { color: '#FFB3BA', icon: '🎈' },
  { color: '#87CEEB', icon: '🧠' },
  { color: '#C0C0C0', icon: '🛡️' }
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTagStyle(name) {
  const index = hashString(name.toLowerCase()) % PRESET_STYLES.length;
  return PRESET_STYLES[index];
}
