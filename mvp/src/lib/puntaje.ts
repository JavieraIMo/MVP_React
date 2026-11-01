import { ponderaciones, reglas, type Carrera } from "./datos";

export type Puntajes = {
  nem: number;
  ranking: number;
  lectora: number;
  m1: number;
  m2: number | null;
  ciencias: number | null;
  historia: number | null;
};

export function requiereM2(c: Pick<Carrera, "nombre" | "exigeM2">) {
  if (reglas.m2ObligatoriaExcepto.includes(c.nombre)) return false;
  return c.exigeM2;
}

export function promedioLectoraM1(p: Pick<Puntajes, "lectora" | "m1">) {
  return (p.lectora + p.m1) / 2;
}

export function cumpleMinimoPostulacion(p: Pick<Puntajes, "lectora" | "m1">) {
  return promedioLectoraM1(p) >= reglas.minimoPostulacion;
}

export function mejorOptativa(p: Pick<Puntajes, "ciencias" | "historia">) {
  const c = p.ciencias ?? -1;
  const h = p.historia ?? -1;
  if (c < 0 && h < 0) return { prueba: null as null | "Ciencias" | "Historia y Cs. Sociales", puntaje: 0 };
  return c >= h ? { prueba: "Ciencias" as const, puntaje: c } : { prueba: "Historia y Cs. Sociales" as const, puntaje: h };
}

export type FilaDesglose = { prueba: string; puntaje: number; peso: number; aporte: number };

export function calcularPonderado(p: Puntajes, conM2: boolean) {
  const opt = mejorOptativa(p);
  const filas: FilaDesglose[] = [];
  const add = (prueba: string, puntaje: number, peso: number) =>
    filas.push({ prueba, puntaje, peso, aporte: puntaje * peso });
  if (conM2) {
    const w = ponderaciones.conM2;
    add("NEM", p.nem, w.nem);
    add("Ranking", p.ranking, w.ranking);
    add("Competencia Lectora", p.lectora, w.lectora);
    add("M1", p.m1, w.m1);
    add("M2", p.m2 ?? 0, w.m2);
    add(`Optativa: ${opt.prueba ?? "sin rendir"}`, opt.puntaje, w.optativa);
  } else {
    const w = ponderaciones.sinM2;
    add("NEM", p.nem, w.nem);
    add("Ranking", p.ranking, w.ranking);
    add("Competencia Lectora", p.lectora, w.lectora);
    add("M1", p.m1, w.m1);
    add(`Optativa: ${opt.prueba ?? "sin rendir"}`, opt.puntaje, w.optativa);
  }
  const total = Math.round(filas.reduce((s, f) => s + f.aporte, 0) * 100) / 100;
  return { total, filas, optativa: opt.prueba };
}

/** El ponderado debe alcanzar el puntaje ponderado mínimo exigido por la carrera. */
export function cumplePonderadoMinimo(total: number, minimo: number | null | undefined) {
  return minimo == null ? true : total >= minimo;
}
