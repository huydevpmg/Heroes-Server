// Generates a random flat color from a preset palette
export function getRandomColor() {
    const colors = [
      '#EF4444', // Red
      '#F59E42', // Orange
      '#FBBF24', // Yellow
      '#22C55E', // Green
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#6B7280', // Gray
      '#14B8A6', // Teal
      '#F472B6', // Rose
      '#FACC15', // Gold
      '#10B981', // Emerald
      '#6366F1', // Indigo
      '#A21CAF', // Violet
      '#4338CA', // Deep Blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  export function getRandomIcon() {
    const icons = [
      '🏷️', '⭐', '🔥', '🌈', '💡', '📌', '🎯', '📝',
      '✅', '⚡', '🚀', '🎉', '🔖', '🛡️', '🔑', '💎', '📦'
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  }