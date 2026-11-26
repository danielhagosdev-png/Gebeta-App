import type React from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { WEB_APP_HTML } from './webAppHtml';
import { initAds, showAppOpenAd, showInterstitial } from './ads';

const BACKGROUND = '#140D08';
const APP_ORIGIN = 'https://gebeta.app/';
// Tells the web game that an ad has finished (or was skipped), so the match can start.
const AD_DONE_SCRIPT = "window.dispatchEvent(new Event('gebeta-ad-done')); true;";

type BridgeMessage =
  | { type: 'haptic'; kind: 'light' | 'medium' | 'success' }
  | { type: 'requestReview' }
  | { type: 'requestInterstitial' };

// Messages sent by the web game through window.ReactNativeWebView.postMessage.
async function handleBridgeMessage(
  raw: string,
  replyWithScript: (script: string) => void,
): Promise<void> {
  let message: BridgeMessage;
  try {
    message = JSON.parse(raw);
  } catch {
    return;
  }
  if (!message || typeof message !== 'object') return;

  try {
    if (message.type === 'haptic') {
      if (message.kind === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (message.kind === 'medium') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else if (message.type === 'requestReview') {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      }
    } else if (message.type === 'requestInterstitial') {
      await showInterstitial();
      replyWithScript(AD_DONE_SCRIPT);
    }
  } catch {
    // The native feature is unavailable on this device. The game keeps working.
    if (message.type === 'requestInterstitial') replyWithScript(AD_DONE_SCRIPT);
  }
}

export default function App() {
  const webViewRef = useRef<React.ComponentRef<typeof WebView>>(null);

  useEffect(() => {
    initAds()
      .then(() => showAppOpenAd())
      .catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <WebView
          ref={webViewRef}
          style={styles.webview}
          originWhitelist={['*']}
          source={{ html: WEB_APP_HTML, baseUrl: APP_ORIGIN }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          setBuiltInZoomControls={false}
          overScrollMode="never"
          bounces={false}
          onMessage={(event: WebViewMessageEvent) => {
            handleBridgeMessage(event.nativeEvent.data, (script) =>
              webViewRef.current?.injectJavaScript(script),
            );
          }}
          onShouldStartLoadWithRequest={(request) => {
            // Keep the game inside the WebView. Send mailto and http links (e.g. Share) to other apps.
            if (request.url.startsWith(APP_ORIGIN) || request.url.startsWith('about:')) {
              return true;
            }
            Linking.openURL(request.url).catch(() => {});
            return false;
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  webview: { flex: 1, backgroundColor: BACKGROUND },
});
