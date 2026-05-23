/**
 * Toast global — remplace alert() dans toute l'app sans prop drilling.
 * Monté via GlobalToastHost dans YorixApp.
 */

/** @typedef {{ msg: string, type?: string, duration?: number }} ToastPayload */

/** @type {Set<(p: ToastPayload) => void>} */
const listeners = new Set();

/**
 * @param {string} msg
 * @param {'error'|'success'|'info'|'warning'} [type]
 * @param {number} [duration]
 */
export function showAppToast(msg, type = "error", duration) {
  const payload = { msg: String(msg || ""), type, duration };
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch {
      /* ignore */
    }
  });
}

/** @param {(p: ToastPayload) => void} fn */
export function subscribeAppToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Remplace window.alert pour les messages user-facing (garde confirm natif). */
export function userFacingError(message) {
  showAppToast(message, "error");
}

export function userFacingSuccess(message, duration = 4500) {
  showAppToast(message, "success", duration);
}

export function userFacingInfo(message, duration = 4500) {
  showAppToast(message, "info", duration);
}

export function userFacingWarning(message, duration = 5500) {
  showAppToast(message, "warning", duration);
}
