import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/app/Layout";
import { campusDe, carreras } from "@/lib/datos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Admisión USM 2027 — Orientador de carrera" },
      { name: "description", content: "Busca carreras USM, simula tu puntaje ponderado y revisa actividades de Admisión 2027 en un solo lugar." },
      { property: "og:title", content: "Admisión USM 2027 — Orientador de carrera" },
      { property: "og:description", content: "Simulador de puntaje, explorador de carreras y actividades USM." },
    ],
  }),
  component: Home,
});

const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const MAX_SUGERENCIAS = 6;

function BuscadorCarreras() {
  const [q, setQ] = useState("");
  const [activo, setActivo] = useState(-1);
  const [abierto, setAbierto] = useState(false);
  const nav = useNavigate();

  const consulta = normalizar(q.trim());
  const todas = consulta
    ? carreras
        .filter((c) => normalizar(`${c.nombre} ${c.codigoDemre}`).includes(consulta))
        .sort((a, b) => Number(!normalizar(a.nombre).startsWith(consulta)) - Number(!normalizar(b.nombre).startsWith(consulta)))
    : [];
  const sugerencias = todas.slice(0, MAX_SUGERENCIAS);
  const visible = abierto && consulta !== "";

  const ir = (codigo: string) => nav({ to: "/carreras/$codigo", params: { codigo } });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && sugerencias.length) {
      e.preventDefault();
      setAbierto(true);
      setActivo((activo + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp" && sugerencias.length) {
      e.preventDefault();
      setActivo((activo - 1 + sugerencias.length) % sugerencias.length);
    } else if (e.key === "Escape") {
      setAbierto(false);
      setActivo(-1);
    } else if (e.key === "Enter" && visible && activo >= 0 && sugerencias[activo]) {
      e.preventDefault();
      ir(sugerencias[activo].codigoDemre);
    }
  };

  return (
    <form
      role="search"
      className="relative mt-4 flex max-w-xl gap-2"
      onSubmit={(e) => { e.preventDefault(); nav({ to: "/carreras", search: { q } }); }}
    >
      <div className="relative flex-1">
        <label htmlFor="q-home" className="sr-only">Buscar carrera por nombre o código DEMRE</label>
        <input
          id="q-home"
          type="search"
          autoFocus
          autoComplete="off"
          role="combobox"
          aria-expanded={visible}
          aria-controls="sugerencias-carreras"
          aria-autocomplete="list"
          aria-activedescendant={activo >= 0 ? `sugerencia-${activo}` : undefined}
          className="field text-foreground"
          placeholder="Ej: Informática, Comercial…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setAbierto(true); setActivo(-1); }}
          onKeyDown={onKeyDown}
          onBlur={() => setAbierto(false)}
          onFocus={() => setAbierto(true)}
        />
        {visible && (
          <div id="sugerencias-carreras" className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border bg-card text-card-foreground shadow-lg">
            {sugerencias.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground" role="status">Sin coincidencias para «{q.trim()}».</p>
            ) : (
              <>
                <ul role="listbox" aria-label="Carreras que coinciden">
                  {sugerencias.map((c, i) => (
                    <li
                      key={c.codigoDemre}
                      id={`sugerencia-${i}`}
                      role="option"
                      aria-selected={i === activo}
                      className={`flex cursor-pointer flex-wrap items-baseline justify-between gap-x-3 px-3 py-2 text-sm ${i === activo ? "bg-secondary" : "hover:bg-secondary"}`}
                      onMouseDown={(e) => { e.preventDefault(); ir(c.codigoDemre); }}
                    >
                      <span className="font-semibold">{c.nombre}</span>
                      <span className="text-xs text-muted-foreground">{campusDe(c).join(", ")} · DEMRE {c.codigoDemre}</span>
                    </li>
                  ))}
                </ul>
                <p className="border-t px-3 py-1.5 text-xs text-muted-foreground" role="status">
                  {todas.length > MAX_SUGERENCIAS ? `Mostrando ${MAX_SUGERENCIAS} de ${todas.length} coincidencias. Presiona Buscar para ver todas.` : `${todas.length} ${todas.length === 1 ? "coincidencia" : "coincidencias"}.`}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <button className="btn btn-accent shrink-0 self-start">Buscar</button>
    </form>
  );
}

function Home() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground md:max-h-[40vh]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Admisión 2027</p>
          <h1 className="mt-1 text-2xl font-bold md:text-4xl">Encuentra tu carrera en la USM</h1>
          <BuscadorCarreras />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link to="/simulador" className="action-tile action-tile-main">
            <span className="action-tile-title">Simular mi puntaje <span aria-hidden="true">→</span></span>
            <span className="action-tile-text">Compara tu ponderado con el mínimo de selección 2027 de hasta 20 carreras.</span>
          </Link>
          <Link to="/carreras" search={{ q: "" }} className="action-tile">
            <span className="action-tile-title">Explorar carreras <span aria-hidden="true">→</span></span>
            <span className="action-tile-text">{carreras.length} carreras con código DEMRE, campus y mínimo de selección.</span>
          </Link>
          <Link to="/actividades" className="action-tile">
            <span className="action-tile-title">Ver actividades <span aria-hidden="true">→</span></span>
            <span className="action-tile-text">Charlas, talleres y ferias con fecha, sede y cupos.</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
