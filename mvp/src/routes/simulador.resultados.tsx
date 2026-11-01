import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout, NoDisponible, NotaReferencial, SedeBadges } from "@/components/app/Layout";
import { campusDe, carreras, reglas } from "@/lib/datos";
import { cumplePonderadoMinimo, calcularPonderado, cumpleMinimoPostulacion, promedioLectoraM1, requiereM2 } from "@/lib/puntaje";
import { leerSimulacion, type Simulacion } from "@/lib/simulacion";

export const Route = createFileRoute("/simulador/resultados")({
  head: () => ({
    meta: [
      { title: "Resultados de simulación — Admisión USM 2027" },
      { name: "description", content: "Desglose por prueba y comparación con el mínimo de selección 2027." },
      { property: "og:title", content: "Resultados de simulación USM" },
      { property: "og:description", content: "Tu ponderado frente al corte de cada carrera." },
    ],
  }),
  component: Resultados,
});

function Resultados() {
  const [s, setS] = useState<Simulacion | null | undefined>(undefined);
  useEffect(() => setS(leerSimulacion()), []);

  if (s === undefined) return <Layout><p className="p-6">Cargando…</p></Layout>;
  if (!s)
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p>No hay una simulación guardada.</p>
          <Link to="/simulador" search={{ carrera: undefined }} className="btn mt-3">Ir al simulador</Link>
        </div>
      </Layout>
    );

  const p = s.puntajes;
  const ok = cumpleMinimoPostulacion(p);
  const prom = promedioLectoraM1(p);

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Link to="/simulador" search={{ carrera: undefined }} className="text-sm text-primary underline">← Editar puntajes</Link>
        <h1 className="mt-2 text-2xl font-bold text-primary">Resultados de simulación</h1>

        {!ok ? (
          <div role="alert" className="mt-4 rounded-md border-l-8 border-destructive bg-card p-4">
            <p className="font-bold text-destructive">No cumples el requisito mínimo para postular a la USM.</p>
            <p className="mt-1 text-sm">El promedio entre Competencia Lectora y M1 es {prom.toFixed(1)}, y debe ser al menos {reglas.minimoPostulacion}. Esto aplica independiente de tu ponderado.</p>
          </div>
        ) : (
          <p className="mt-4 rounded-md border-l-8 border-success bg-card p-3 text-sm">
            Cumples el mínimo de postulación: promedio Lectora + M1 = {prom.toFixed(1)} (≥ {reglas.minimoPostulacion}).
          </p>
        )}

        <ol className="mt-4 space-y-4">
          {s.preferencias.map((cod, i) => {
            const c = carreras.find((x) => x.codigoDemre === cod);
            if (!c) return null;
            const conM2 = requiereM2(c);
            const r = calcularPonderado(p, conM2);
            const corte = c.minimoSeleccion2027;
            const dif = corte != null ? Math.round((r.total - corte) * 100) / 100 : null;
            return (
              <li key={cod} className="card-box p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Preferencia {i + 1} · DEMRE {c.codigoDemre}</p>
                    <h2 className="text-lg font-bold">{c.nombre}</h2>
                    <SedeBadges sedes={campusDe(c)} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Tu ponderado</p>
                    <p className="font-display text-3xl font-bold text-primary">{r.total.toFixed(2)}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  Mínimo selección 2027: {corte ?? <NoDisponible />}
                  {dif != null && (
                    <strong className={dif >= 0 ? "ml-2 text-success" : "ml-2 text-destructive"}>
                      {dif >= 0 ? `+${dif}` : dif} pts {dif >= 0 ? "sobre el corte" : "bajo el corte"}
                    </strong>
                  )}
                </p>
                {c.puntajePonderadoMinimo != null && !cumplePonderadoMinimo(r.total, c.puntajePonderadoMinimo) && (
                  <p role="alert" className="mt-2 rounded-md border-l-4 border-destructive bg-secondary px-3 py-2 text-sm">
                    Tu ponderado no alcanza el puntaje ponderado mínimo de postulación de esta carrera ({c.puntajePonderadoMinimo}).
                  </p>
                )}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="text-left text-xs text-muted-foreground">Desglose ({conM2 ? "tabla con M2" : "tabla sin M2"})</caption>
                    <thead><tr className="border-b text-left"><th className="py-1">Prueba</th><th>Puntaje</th><th>Peso</th><th className="text-right">Aporte</th></tr></thead>
                    <tbody>
                      {r.filas.map((f) => (
                        <tr key={f.prueba} className="border-b last:border-0">
                          <td className="py-1">{f.prueba}</td><td>{f.puntaje}</td><td>{Math.round(f.peso * 100)}%</td>
                          <td className="text-right font-medium">{f.aporte.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-6"><NotaReferencial /></div>
      </div>
    </Layout>
  );
}
