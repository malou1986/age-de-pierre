// Safe Haptic Feedback Utility for Mobile & Web
// Automatically uses navigator.vibrate when available (mobile browsers / Capacitor WebView)

let hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean) {
  hapticsEnabled = enabled;
  try {
    localStorage.setItem('age_de_pierre_haptics', enabled ? '1' : '0');
  } catch {}
}

export function isHapticsEnabled(): boolean {
  try {
    const saved = localStorage.getItem('age_de_pierre_haptics');
    if (saved !== null) {
      return saved === '1';
    }
  } catch {}
  return true;
}

// Internal safe vibration trigger
function vibrate(pattern: number | number[]) {
  if (!hapticsEnabled) return;
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignored if device doesn't support or permission blocked
    }
  }
}

export const haptic = {
  // Light subtle tap (button clicks, worker placement)
  tap: () => vibrate(15),

  // Medium feedback (card selection, meeple recall)
  medium: () => vibrate(30),

  // Success double pulse (card purchase, building construction)
  success: () => vibrate([25, 40, 35]),

  // Dice roll rattle
  diceRoll: () => vibrate([15, 20, 15, 20, 20]),

  // Warning vibration (hunger, missing resources, cancellation)
  warning: () => vibrate([50, 40, 70]),

  // End-game fanfare vibration
  victory: () => vibrate([40, 50, 40, 50, 80]),
};
