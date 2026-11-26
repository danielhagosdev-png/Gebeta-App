import mobileAds, {
  AdEventType,
  AppOpenAd,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

// Before release, replace the two placeholder IDs with your AdMob ad unit IDs.
// Development builds always use Google's test IDs, so you never tap live ads.
const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIAL_UNIT_ID';
const APP_OPEN_ID = __DEV__
  ? TestIds.APP_OPEN
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/APP_OPEN_UNIT_ID';

let interstitial: InterstitialAd | null = null;
let interstitialReady = false;

function preloadInterstitial(): void {
  const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);
  ad.addAdEventListener(AdEventType.LOADED, () => {
    interstitialReady = true;
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    interstitialReady = false;
  });
  ad.load();
  interstitial = ad;
}

export async function initAds(): Promise<void> {
  await mobileAds().initialize();
  preloadInterstitial();
}

// Shows the interstitial and resolves when it closes. If no ad is ready, resolves at once,
// so the match is never blocked.
export function showInterstitial(): Promise<void> {
  return new Promise((resolve) => {
    const ad = interstitial;
    if (!ad || !interstitialReady) {
      preloadInterstitial();
      resolve();
      return;
    }
    interstitialReady = false;
    const unsubscribers: Array<() => void> = [];
    const finish = () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      resolve();
      preloadInterstitial();
    };
    unsubscribers.push(ad.addAdEventListener(AdEventType.CLOSED, finish));
    unsubscribers.push(ad.addAdEventListener(AdEventType.ERROR, finish));
    ad.show().catch(finish);
  });
}

// App Open ad, shown once when the app starts.
export function showAppOpenAd(): void {
  const ad = AppOpenAd.createForAdRequest(APP_OPEN_ID);
  ad.addAdEventListener(AdEventType.LOADED, () => {
    ad.show().catch(() => {});
  });
  ad.load();
}
