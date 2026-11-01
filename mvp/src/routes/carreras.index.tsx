import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layout, NoDisponible, NotaReferencial, SedeBadges } from "@/components/app/Layout";
import { campusDe, carreras, ordenSede } from "@/lib/datos";

export const Route = createFileRoute("/carreras/")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({ q: s["q"] != null ? String(s["q"]) : undefined }),
  head: () => ({
    meta: [
      { title: "Carreras USM — Admisión 2027" },
      { name: "description", content: "Listado de carreras USM con código DEMRE, campus y mínimo de selección 2027." },
      { property: "og:title", content: "Carreras USM — Admisión 2027" },
      { property: "og:description", content: "Busca y filtra carreras por campus y área." },
    ],
  }),
  component: Listado,
});

const quitar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function Listado() {
  const { q: q0 } = Route.useSearch();
  const [q, setQ] = useState(q0 ?? "");
  const [campus, setCampus] = useState("");
  const [area, setArea] = useState("");
  const campusList = [...new Set(carreras.flatMap((c) => campusDe(c)))].sort((a, b) => ordenSede(a) - ordenSede(b));
  const areas = [...new Set(carreras.map((c) => c.area))].sort();
  const lista = useMemo(
    () =>
      carreras.filter(
        (c) =>
          (!q || quitar(`${c.nombre} ${c.codigoDemre}`).includes(quitar(q))) &&
          (!campus || campusDe(c).includes(campus)) &&
          (!area || c.area === area),
      ),
    [q, campus, area],
  );

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-primary">Carreras</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="q" className="text-sm font-medium">Buscar</label>
            <input id="q" className="field mt-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o código DEMRE" />
          </div>
          <div>
            <label htmlFor="campus" className="text-sm font-medium">Campus</label>
            <select id="campus" className="field mt-1" value={campus} onChange={(e) => setCampus(e.target.value)}>
              <option value="">Todos</option>
              {campusList.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="area" className="text-sm font-medium">Área</label>
            <select id="area" className="field mt-1" value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas</option>
              {areas.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{lista.length} de {carreras.length} carreras</p>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <li key={c.codigoDemre}>
              <Link to="/carreras/$codigo" params={{ codigo: c.codigoDemre }} className="card-box flex h-full flex-col gap-2 p-4 hover:border-primary">
                <span className="text-xs font-semibold text-muted-foreground">Código DEMRE {c.codigoDemre}</span>
                <span className="font-display text-lg font-semibold text-primary">{c.nombre}</span>
                <SedeBadges sedes={campusDe(c)} />
                <span className="mt-auto text-sm">
                  Mínimo selección 2027: {c.minimoSeleccion2027 ?? <NoDisponible />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6"><NotaReferencial /></div>
      </div>
    </Layout>
  );
}
