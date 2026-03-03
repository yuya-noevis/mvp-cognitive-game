/**
 * デバイス情報取得ユーティリティ
 *
 * セッションログに含めるデバイス情報文字列を生成する。
 * User-Agentのパースは行わず、シンプルな環境情報を収集する。
 */

/**
 * デバイス情報を取得する。
 * SSR環境では安全なフォールバック値を返す。
 *
 * @returns デバイス情報文字列（例: "Mobile / 390x844 / Safari"）
 */
export function getDeviceInfo(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'unknown';
  }

  const parts: string[] = [];

  // デバイスタイプ判定
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isTablet = /Tablet|iPad/i.test(navigator.userAgent);
  if (isTablet) {
    parts.push('Tablet');
  } else if (isMobile) {
    parts.push('Mobile');
  } else {
    parts.push('Desktop');
  }

  // 画面サイズ
  parts.push(`${window.screen.width}x${window.screen.height}`);

  // タッチサポート
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (hasTouch) {
    parts.push('Touch');
  }

  // ブラウザ推定（シンプルな判定）
  const ua = navigator.userAgent;
  if (ua.includes('CriOS') || (ua.includes('Chrome') && !ua.includes('Edg'))) {
    parts.push('Chrome');
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    parts.push('Safari');
  } else if (ua.includes('Firefox')) {
    parts.push('Firefox');
  } else if (ua.includes('Edg')) {
    parts.push('Edge');
  }

  return parts.join(' / ');
}
