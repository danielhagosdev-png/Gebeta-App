// Bridge to the native app shell (Expo). In a normal browser these calls do nothing.
type NativeMessage =
  | { type: 'haptic'; kind: 'light' | 'medium' | 'success' }
  | { type: 'requestReview' };

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
