/** Phone HUD media query (1023 = phone, 1024 = laptop). */
export const PHONE_MQ = '(max-width: 1023px)';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPhoneViewport(): boolean {
  return window.matchMedia(PHONE_MQ).matches;
}
