import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChipGroup, Layout, SedeBadges } from "@/components/app/Layout";
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
const slug = (s: string) => quitar(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const FONDO_AREA: Record<string, string> = {
  "Arquitectura y Construcción": "from-amber-700 to-stone-800",
  Ciencias: "from-violet-700 to-indigo-900",
  Ingeniería: "from-blue-700 to-slate-900",
  Negocios: "from-emerald-700 to-teal-900",
};

// Foto en /public/carreras/<slug>.png; si no existe, se muestra un fondo por área.
function ImagenCarrera({ nombre, area }: { nombre: string; area: string }) {
  const [falla, setFalla] = useState(false);
  if (falla) {
    return <div aria-hidden="true" className={`h-28 w-full bg-gradient-to-br ${FONDO_AREA[area] ?? "from-blue-700 to-slate-900"}`} />;
  }
  return <img src={`/carreras/${slug(nombre)}.png`} alt="" loading="lazy" onError={() => setFalla(true)} className="h-28 w-full object-cover" />;
}

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

  const grupos = useMemo(() => {
    const m = new Map<string, typeof carreras>();
    for (const c of lista) m.set(c.nombre, [...(m.get(c.nombre) ?? []), c]);
    return [...m.entries()].map(([nombre, variantes]) => ({
      nombre,
      variantes: [...variantes].sort((a, b) => ordenSede(campusDe(a)[0] ?? "") - ordenSede(campusDe(b)[0] ?? "")),
    }));
  }, [lista]);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-primary">Carreras</h1>
        <div className="mt-4 max-w-xl">
          <label htmlFor="q" className="text-sm font-medium">Buscar por nombre o código DEMRE</label>
          <input id="q" type="search" autoFocus className="field mt-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: Informática o 15160" />
        </div>
        <div className="mt-3 space-y-3">
          <ChipGroup label="Sede/Campus" opciones={campusList} valor={campus} onChange={setCampus} />
          <ChipGroup label="Área" opciones={areas} valor={area} onChange={setArea} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{grupos.length} carreras ({lista.length} de {carreras.length} opciones de ingreso)</p>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grupos.map((g) => (
            <li key={g.nombre} className="card-box lift flex h-full flex-col overflow-hidden">
              <ImagenCarrera nombre={g.nombre} area={g.variantes[0]!.area} />
              <div className="flex flex-1 flex-col p-4">
              <h2 className="font-display text-lg font-semibold text-primary">{g.nombre}</h2>
              <ul className="mt-2 divide-y">
                {g.variantes.map((c) => (
                  <li key={c.codigoDemre}>
                    <Link to="/carreras/$codigo" params={{ codigo: c.codigoDemre }} className="flex flex-col gap-1 py-2 hover:bg-muted/50">
                      <SedeBadges sedes={campusDe(c)} />
                      <span className="text-sm text-muted-foreground">Código DEMRE {c.codigoDemre}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
