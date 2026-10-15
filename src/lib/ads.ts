import Constants, { ExecutionEnvironment } from 'expo-constants';

// Expo Go no incluye el SDK de anuncios: ahí la app funciona igual, pero sin anuncios.
export const adsAvailable = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

type AdsModule = typeof import('react-native-google-mobile-ads');

const ads: AdsModule | null = adsAvailable ? require('react-native-google-mobile-ads') : null;

export function getAdsModule() {
  return ads;
}

/** IDs reales por variables de entorno; en desarrollo, siempre los de prueba de Google. */
export function adUnitId(kind: 'banner' | 'interstitial') {
  if (!ads) return '';
  const real =
    kind === 'banner' ? process.env.EXPO_PUBLIC_ADMOB_BANNER_ID : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID;
  if (__DEV__ || !real) return kind === 'banner' ? ads.TestIds.ADAPTIVE_BANNER : ads.TestIds.INTERSTITIAL;
  return real;
}

/** Peticiones sin personalización: la app está dirigida a niños. */
export const childSafeRequest = { requestNonPersonalizedAdsOnly: true };

let started: Promise<void> | null = null;

/** Configura AdMob para público infantil (Familias de Google Play) y lo arranca. */
export function startAds() {
  if (!ads) return Promise.resolve();
  started ??= ads
    .default()
    .setRequestConfiguration({
      maxAdContentRating: ads.MaxAdContentRating.G,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
    })
    .then(() => ads.default().initialize())
    .then(() => {
      loadInterstitial();
    })
    .catch(() => {});
  return started;
}

// --- Intersticial entre letras ---

const EVERY_N_COMPLETIONS = 3;
const MIN_SECONDS_BETWEEN = 90;

let interstitial: ReturnType<AdsModule['InterstitialAd']['createForAdRequest']> | null = null;
let interstitialReady = false;
let completions = 0;
let lastShownAt = 0;

function loadInterstitial() {
  if (!ads) return;
  interstitialReady = false;
  interstitial = ads.InterstitialAd.createForAdRequest(adUnitId('interstitial'), childSafeRequest);
  interstitial.addAdEventListener(ads.AdEventType.LOADED, () => {
    interstitialReady = true;
  });
  interstitial.addAdEventListener(ads.AdEventType.CLOSED, () => {
    loadInterstitial();
  });
  interstitial.addAdEventListener(ads.AdEventType.ERROR, () => {
    interstitialReady = false;
  });
  interstitial.load();
}

export function registerCompletion() {
  completions += 1;
}

/**
 * Se llama en una pausa natural (al pasar a la siguiente letra).
 * Muestra un intersticial cada pocas letras y nunca demasiado seguido.
 */
export function maybeShowInterstitial() {
  if (!interstitial || !interstitialReady) return false;
  const now = Date.now();
  if (completions < EVERY_N_COMPLETIONS || now - lastShownAt < MIN_SECONDS_BETWEEN * 1000) return false;
  completions = 0;
  lastShownAt = now;
  interstitial.show().catch(() => {});
  return true;
}
