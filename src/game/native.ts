// Bridge to the native app shell (Expo). In a normal browser these calls do nothing.
type NativeMessage =
  | { type: 'haptic'; kind: 'light' | 'medium' | 'success' }
  | { type: 'requestReview' }
  | { type: 'requestInterstitial' };

function sendToNative(message: NativeMessage): void {
  if (typeof window === 'undefined') return;
  const bridge = (
    window as unknown as {
      ReactNativeWebView?: { postMessage: (data: string) => void };
    }
  ).ReactNativeWebView;
  bridge?.postMessage(JSON.stringify(message));
}

export function haptic(kind: 'light' | 'medium' | 'success' = 'light'): void {
  sendToNative({ type: 'haptic', kind });
}

export function requestReview(): void {
  sendToNative({ type: 'requestReview' });
}

let pendingAd: Promise<void> | null = null;

// Asks the native app to show an interstitial, then resolves when it closes.
// In a browser, or if no ad is available, it resolves at once.
export function requestInterstitial(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const bridge = (window as unknown as { ReactNativeWebView?: unknown })
    .ReactNativeWebView;
  if (!bridge) return Promise.resolve();
  if (pendingAd) return pendingAd;

  pendingAd = new Promise<void>((resolve) => {
    let timer: number | undefined;
    const done = () => {
      window.removeEventListener('gebeta-ad-done', done);
      window.clearTimeout(timer);
      pendingAd = null;
      resolve();
    };
    window.addEventListener('gebeta-ad-done', done);
    // Safety net: never leave the player waiting for an ad.
    timer = window.setTimeout(done, 15000);
    sendToNative({ type: 'requestInterstitial' });
  });
  return pendingAd;
}
