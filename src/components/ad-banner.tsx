import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { adUnitId, childSafeRequest, getAdsModule } from '@/lib/ads';

/** Banner adaptativo anclado abajo. Si no carga, no ocupa sitio. */
export function AdBanner() {
  const ads = getAdsModule();
  const [failed, setFailed] = useState(false);
  if (!ads || failed) return null;

  const { BannerAd, BannerAdSize } = ads;
  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={adUnitId('banner')}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={childSafeRequest}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', backgroundColor: '#fff' },
});
