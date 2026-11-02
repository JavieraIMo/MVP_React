import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { IconoRed, Layout, REDES } from "@/components/app/Layout";
import { campusDe, carreras, fechasClave, formatoFecha, normalizarSede, proximasActividades } from "@/lib/datos";

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

function ProximasActividades() {
  const [hoy] = useState(() => new Date());
  const lista = proximasActividades(hoy, 4);
  return (
    <section aria-labelledby="proximas">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="proximas" className="text-xl font-bold text-primary">Próximas actividades</h2>
        <Link to="/actividades" className="text-sm font-semibold text-primary underline">Ver todas</Link>
      </div>
      {lista.length === 0 ? (
        <p className="card-box mt-3 p-4 text-muted-foreground">No hay actividades próximas.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {lista.map((a) => (
            <li key={a.id}>
              <details className="card-box group">
                <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 p-3">
                  <span className="w-36 shrink-0 text-sm font-bold text-primary">{formatoFecha(a.inicio, a.fin)}</span>
                  <span className="chip-tipo">{a.tipo}</span>
                  <span className="min-w-0 flex-1 basis-48 font-semibold leading-snug">{a.titulo}</span>
                  <span aria-hidden="true" className="text-primary transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="space-y-2 border-t p-3 text-sm">
                  <p>
                    <span className="font-bold text-primary">Sede/Campus:</span>{" "}
                    {normalizarSede(a.sede) === "Online" ? "No aplica (actividad online)" : normalizarSede(a.sede)}
                    {a.lugar && a.lugar !== a.sede ? ` · ${a.lugar}` : ""}
                  </p>
                  <p><span className="font-bold text-primary">Modalidad:</span> {a.modalidad}</p>
                  <div className="flex justify-end">
                    <Link to="/actividades/$id" params={{ id: a.id }} className="btn btn-back">Ver detalle completo →</Link>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FechasClave() {
  return (
    <section aria-labelledby="fechas-clave">
      <h2 id="fechas-clave" className="text-xl font-bold text-primary">Fechas clave del proceso de admisión</h2>
      {fechasClave.length === 0 ? (
        <p className="card-box mt-3 border-l-8 border-l-accent bg-[color-mix(in_oklab,var(--accent)_30%,white)] p-4 text-base font-medium text-foreground">
          Las fechas oficiales del proceso de admisión 2027 se publican en{" "}
          <a href="https://demre.cl" target="_blank" rel="noreferrer" className="font-bold underline">demre.cl</a>.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {fechasClave.map((f) => (
            <li key={f.hito} className="card-box flex items-baseline gap-3 border-l-4 border-l-accent p-3">
              <span className="w-28 shrink-0 text-sm font-bold text-primary">{f.fecha}</span>
              <span className="font-semibold">{f.hito}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Home() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12 md:py-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Admisión 2027</p>
            <h1 className="mt-1 text-2xl font-bold md:text-4xl">Encuentra tu carrera en la USM</h1>
            <BuscadorCarreras />
          </div>
          <nav aria-label="Redes oficiales USM" className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 p-4 md:max-w-md md:justify-self-end">
            <p className="text-sm font-bold">Redes oficiales USM:</p>
            <ul className="mt-3 flex flex-nowrap gap-2">
              {REDES.map((r) => (
                <li key={r.label}>
                  <a href={r.href} target="_blank" rel="noreferrer" className="footer-link" aria-label={`${r.label} (se abre en una pestaña nueva)`} title={r.label}><IconoRed label={r.label} /></a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ProximasActividades />
          <FechasClave />
        </div>
      </div>
    </Layout>
  );
}
