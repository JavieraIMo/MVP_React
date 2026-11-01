import type { Puntajes } from "./puntaje";

export type Simulacion = { puntajes: Puntajes; preferencias: string[] };
const KEY = "usm-simulacion";

export function guardarSimulacion(s: Simulacion) {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}
export function leerSimulacion(): Simulacion | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Simulacion) : null;
  } catch {
    return null;
  }
}
