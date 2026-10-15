import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const KEY = 'progreso-v1';

/** Veces que se ha completado cada letra o número, por id. */
type Progress = Record<string, number>;

let progress: Progress = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

AsyncStorage.getItem(KEY)
  .then((raw) => {
    if (raw) {
      progress = { ...JSON.parse(raw), ...progress };
      emit();
    }
  })
  .catch(() => {});

export function markCompleted(id: string) {
  progress = { ...progress, [id]: (progress[id] ?? 0) + 1 };
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(progress)).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => progress, () => progress);
}
