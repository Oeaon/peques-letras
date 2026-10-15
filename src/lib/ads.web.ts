// En web no hay anuncios: mismas funciones, sin efecto.

export const adsAvailable = false;

export function getAdsModule() {
  return null;
}

export function startAds() {
  return Promise.resolve();
}

export function registerCompletion() {}

export function maybeShowInterstitial() {
  return false;
}
