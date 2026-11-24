/** Browsers may refuse (no user gesture, unsupported device); the exam must still work. */
export async function enterFullscreen() {
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    // Continue in a normal window.
  }
}

export async function exitFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {
    // Nothing to leave.
  }
}

export function toggleFullscreen() {
  return document.fullscreenElement ? exitFullscreen() : enterFullscreen();
}
