# Peques: Letras y Números

App infantil (3–6 años) en React Native + Expo para aprender a trazar letras (con Ñ) y números en español.

## Qué hay ya

- Menú con las 27 letras y los números del 0 al 9.
- Pantalla de trazado: el niño arrastra el punto verde siguiendo la letra, trazo a trazo y en el sentido correcto. Es tolerante: no hay que ser exacto y el progreso no se pierde al levantar el dedo.
- Al terminar: dibujo de recompensa, voz ("¡Muy bien! A de Avión"), vibración, y botones de "Otra vez" y "Siguiente".

## Ejecutar

```bash
npm install
npx expo start        # escanea el QR con Expo Go
npx expo start --web  # en el navegador
```

## Estructura

- `src/data/glyphs.ts`: trazos de cada letra y número (caja de 100 × 100).
- `src/lib/geometry.ts`: líneas, arcos, remuestreo y lógica de avance del trazo.
- `src/components/trace-board.tsx`: la pizarra (SVG + gestos).
- `src/app/`: pantallas (Expo Router).

## Próximos pasos

1. Guardar el progreso y crear el álbum de pegatinas (AsyncStorage).
2. Audios grabados en lugar de la voz del sistema.
3. Anuncios AdMob para familias (`react-native-google-mobile-ads`, `tagForChildDirectedTreatment`).
4. Compra "Desbloquear todo" con control parental.
5. Icono y pantalla de carga propios.
