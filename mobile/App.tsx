import { StyleSheet, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { WEB_APP_HTML } from './webAppHtml';

const BACKGROUND = '#140D08';
const APP_ORIGIN = 'https://gebeta.app/';

type BridgeMessage =
  | { type: 'haptic'; kind: 'light' | 'medium' | 'success' }
  | { type: 'requestReview' };

// Messages sent by the web game through window.ReactNativeWebView.postMessage.
async function handleBridgeMessage(raw: string): Promise<void> {
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
    }
  } catch {
    // The native feature is unavailable on this device. The game keeps working.
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <WebView
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
            handleBridgeMessage(event.nativeEvent.data);
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
