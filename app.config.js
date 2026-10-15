// Los IDs reales de AdMob se pasan por variables de entorno (ver .env.example).
// Sin ellas se usan los IDs de prueba de Google que hay en app.json.
module.exports = ({ config }) => {
  const androidAppId = process.env.ADMOB_ANDROID_APP_ID;
  const iosAppId = process.env.ADMOB_IOS_APP_ID;

  const plugins = config.plugins.map((plugin) => {
    if (!Array.isArray(plugin) || plugin[0] !== 'react-native-google-mobile-ads') return plugin;
    const [name, options] = plugin;
    return [
      name,
      {
        ...options,
        ...(androidAppId && { androidAppId }),
        ...(iosAppId && { iosAppId }),
      },
    ];
  });

  return { ...config, plugins };
};
