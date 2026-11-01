import carrerasJson from "@/data/carreras.json";
import actividadesJson from "@/data/actividades.json";

export type Carrera = {
  codigoDemre: string;
  nombre: string;
  campus: string[];
  area: string;
  exigeM2: boolean;
  titulo: string;
  grado: string;
  duracion: string;
  regimen: string;
  arancel: number | string | null;
  minimoSeleccion2027: number | null;
  maximoSeleccion2027?: number | null;
  puntajePonderadoMinimo?: number | null;
  vacantes2027?: number | null;
  /** Cupos adicionales del programa Mujeres Científicas (columna "MC 2027" del listado de cortes). */
  mc2027?: number | null;
  perfilEgreso: string;
  malla: Record<string, string[]> | string[][] | null;
};

export type Actividad = {
  id: string;
  titulo: string;
  inicio: string; // ISO "2026-11-03T12:30"
  fin?: string | null; // ISO, para rangos
  horaFin?: string | null; // "13:30"
  sede: string;
  lugar?: string | null; // sala, auditorio o dirección
  modalidad: "Presencial" | "Online" | "Híbrida";
  organizador: string;
  publico?: string | null;
  tematica?: string | null;
  contacto?: string | null;
  cupos: number | null;
  descripcion?: string;
  afiche?: string | null;
  afícheAlt?: string;
  enlace?: string | null;
};

export const ponderaciones = carrerasJson.ponderaciones;
export const reglas = carrerasJson.reglas;
export const carreras = carrerasJson.carreras as Carrera[];
export const actividades = (actividadesJson.actividades ?? []) as Actividad[];

export const SEDES = [
  "Sede Viña del Mar",
  "Sede Concepción",
  "Campus San Joaquín",
  "Campus Casa Central Valparaíso",
  "Campus Vitacura",
  "Online",
] as const;

/** Normaliza variantes de nombre de sede al formato canónico. */
export function normalizarSede(raw: string): string {
  const s = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (s.includes("vina")) return "Sede Viña del Mar";
  if (s.includes("concepcion")) return "Sede Concepción";
  if (s.includes("joaquin") || s.includes("santiago sj")) return "Campus San Joaquín";
  if (s.includes("casa central") || s.includes("valparaiso")) return "Campus Casa Central Valparaíso";
  if (s.includes("vitacura")) return "Campus Vitacura";
  if (s.includes("online") || s.includes("virtual") || s.includes("remot")) return "Online";
  return raw;
}

export function ordenSede(s: string) {
  const i = (SEDES as readonly string[]).indexOf(normalizarSede(s));
  return i === -1 ? 99 : i;
}

/** Siempre devuelve 10 columnas (semestre 1 a 10). */
export function mallaDiezColumnas(malla: Carrera["malla"]): string[][] {
  const cols: string[][] = Array.from({ length: 10 }, () => []);
  if (!malla) return cols;
  if (Array.isArray(malla)) {
    malla.slice(0, 10).forEach((r, i) => (cols[i] = [...r]));
  } else {
    for (const [k, v] of Object.entries(malla)) {
      const n = parseInt(k.replace(/\D/g, ""), 10);
      if (n >= 1 && n <= 10 && Array.isArray(v)) cols[n - 1] = [...v];
    }
  }
  return cols;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

function partes(iso: string) {
  const [d, t] = iso.split("T");
  const [y, m, day] = (d ?? "").split("-").map(Number);
  return { y: y ?? 0, m: m ?? 1, d: day ?? 1, t: t?.slice(0, 5) ?? null };
}

/** "3 nov 2026 · 12:30" o "27 oct – 3 nov 2026" */
export function formatoFecha(inicio: string, fin?: string | null): string {
  const a = partes(inicio);
  if (fin && fin.slice(0, 10) !== inicio.slice(0, 10)) {
    const b = partes(fin);
    const izq = a.y === b.y ? `${a.d} ${MESES[a.m - 1]}` : `${a.d} ${MESES[a.m - 1]} ${a.y}`;
    return `${izq} – ${b.d} ${MESES[b.m - 1]} ${b.y}`;
  }
  return `${a.d} ${MESES[a.m - 1]} ${a.y}${a.t ? ` · ${a.t}` : ""}`;
}

export function formatoArancel(a: Carrera["arancel"]) {
  if (a === null || a === "") return null;
  if (typeof a === "number") return `$${a.toLocaleString("es-CL")}`;
  return a;
}

/** Campus de una carrera, normalizados y en el orden canónico. */
export function campusDe(c: Pick<Carrera, "campus">): string[] {
  return [...new Set(c.campus.map(normalizarSede))].sort((a, b) => ordenSede(a) - ordenSede(b));
}
