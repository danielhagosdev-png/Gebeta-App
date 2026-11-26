import { StyleSheet, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { WEB_APP_HTML } from './webAppHtml';

const BACKGROUND = '#140D08';
const APP_ORIGIN = 'https://gebeta.app/';

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
          onShouldStartLoadWithRequest={(request) => {
            // Keep the game inside the WebView. Send mailto/http links (e.g. Share) to other apps.
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
