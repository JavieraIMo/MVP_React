import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, SedeBadge } from "@/components/app/Layout";
import { actividades, formatoFecha, normalizarSede, ordenSede, SEDES } from "@/lib/datos";

export const Route = createFileRoute("/actividades/")({
  head: () => ({
    meta: [
      { title: "Actividades y novedades — Admisión USM 2027" },
      { name: "description", content: "Ferias, charlas y visitas USM con fecha, sede, modalidad y cupos en texto." },
      { property: "og:title", content: "Actividades Admisión USM 2027" },
      { property: "og:description", content: "Compara actividades USM en tarjetas compactas." },
    ],
  }),
  component: Actividades,
});

function Actividades() {
  const [sede, setSede] = useState("");
  const [mod, setMod] = useState("");
  const modalidades = [...new Set(actividades.map((a) => a.modalidad))];
  const lista = actividades
    .filter((a) => (!sede || normalizarSede(a.sede) === sede) && (!mod || a.modalidad === mod))
    .sort((a, b) => a.inicio.localeCompare(b.inicio) || ordenSede(a.sede) - ordenSede(b.sede));

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-primary">Actividades</h1>
        <div className="mt-4 grid gap-3 sm:max-w-xl sm:grid-cols-2">
          <div>
            <label htmlFor="sede" className="text-sm font-medium">Sede</label>
            <select id="sede" className="field mt-1" value={sede} onChange={(e) => setSede(e.target.value)}>
              <option value="">Todas</option>
              {SEDES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="mod" className="text-sm font-medium">Modalidad</label>
            <select id="mod" className="field mt-1" value={mod} onChange={(e) => setMod(e.target.value)}>
              <option value="">Todas</option>
              {modalidades.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        {lista.length === 0 ? (
          <p className="card-box mt-6 p-6 text-muted-foreground">
            {actividades.length === 0 ? "Aún no hay actividades cargadas en el dataset." : "No hay actividades con estos filtros."}
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lista.map((a) => (
              <li key={a.id}>
                <Link to="/actividades/$id" params={{ id: a.id }} className="card-box flex h-full flex-col gap-2 p-3 hover:border-primary">
                  <span className="text-sm font-bold text-primary">{formatoFecha(a.inicio, a.fin)}</span>
                  <span className="font-semibold leading-snug">{a.titulo}</span>
                  <SedeBadge sede={a.sede} />
                  <dl className="mt-auto grid grid-cols-2 gap-x-2 text-xs">
                    <dt className="text-muted-foreground">Modalidad</dt><dd>{a.modalidad}</dd>
                    <dt className="text-muted-foreground">Organiza</dt><dd>{a.organizador}</dd>
                    <dt className="text-muted-foreground">Cupos</dt><dd>{a.cupos ?? "Sin límite informado"}</dd>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
