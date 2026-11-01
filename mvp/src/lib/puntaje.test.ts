import { describe, expect, it } from "vitest";
import { cumplePonderadoMinimo, calcularPonderado, cumpleMinimoPostulacion, mejorOptativa, requiereM2 } from "./puntaje";
import { formatoFecha, mallaDiezColumnas } from "./datos";

const base = { nem: 700, ranking: 800, lectora: 600, m1: 700, m2: 500, ciencias: 600, historia: 650 };

describe("reglas USM", () => {
  it("mínimo de postulación: promedio Lectora+M1 >= 485", () => {
    expect(cumpleMinimoPostulacion({ lectora: 485, m1: 485 })).toBe(true);
    expect(cumpleMinimoPostulacion({ lectora: 480, m1: 489 })).toBe(false);
  });
  it("usa la mejor optativa", () => {
    expect(mejorOptativa(base)).toEqual({ prueba: "Historia y Cs. Sociales", puntaje: 650 });
  });
  it("tabla con M2: 15/20/35/10/10/10", () => {
    // 700*.15+800*.2+700*.35+500*.1+600*.1+650*.1
    expect(calcularPonderado(base, true).total).toBe(685);
  });
  it("tabla sin M2: 15/25/40/10/10", () => {
    // 700*.15+800*.25+700*.4+600*.1+650*.1
    expect(calcularPonderado(base, false).total).toBe(710);
  });
  it("Ingeniería Comercial no exige M2", () => {
    expect(requiereM2({ nombre: "Ingeniería Comercial", exigeM2: true })).toBe(false);
    expect(requiereM2({ nombre: "Ingeniería Civil Informática", exigeM2: true })).toBe(true);
  });
  it("formato de fechas único", () => {
    expect(formatoFecha("2026-11-03T12:30")).toBe("3 nov 2026 · 12:30");
    expect(formatoFecha("2026-10-27", "2026-11-03")).toBe("27 oct – 3 nov 2026");
  });
  it("malla siempre en 10 columnas", () => {
    expect(mallaDiezColumnas({ "1": ["A"] })).toHaveLength(10);
  });
  it("ponderado mínimo de la carrera (ej. 600)", () => {
    expect(cumplePonderadoMinimo(600, 600)).toBe(true);
    expect(cumplePonderadoMinimo(599.9, 600)).toBe(false);
  });
});
