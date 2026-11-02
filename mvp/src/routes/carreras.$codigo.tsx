import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, NoDisponible } from "@/components/app/Layout";
import { campusDe, carreras, formatoArancel, mallaDiezColumnas, ordenSede } from "@/lib/datos";
import { requiereM2 } from "@/lib/puntaje";

export const Route = createFileRoute("/carreras/$codigo")({
  loader: ({ params }) => {
    const c = carreras.find((x) => x.codigoDemre === params.codigo);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.nombre} (${loaderData.codigoDemre}) — Admisión USM 2027` : "Carrera — Admisión USM" },
      { name: "description", content: loaderData ? `Ficha completa de ${loaderData.nombre}: malla, aranceles, título y mínimo de selección.` : "Ficha de carrera USM" },
      { property: "og:title", content: loaderData?.nombre ?? "Carrera USM" },
      { property: "og:description", content: "Toda la información de la carrera en una sola ficha." },
    ],
  }),
  component: Ficha,
});

function Dato({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 font-medium">{v || <NoDisponible />}</dd>
    </div>
  );
}

type Area = { id: string; nombre: string; color: string };
const AREAS: Record<string, Area> = {
  basicas: { id: "basicas", nombre: "Ciencias Básicas", color: "#d63a3a" },
  ingenieria: { id: "ingenieria", nombre: "Ciencias de la Ingeniería", color: "#e8a020" },
  especialidad: { id: "especialidad", nombre: "Especialidad", color: "#3b6fc4" },
  sociales: { id: "sociales", nombre: "Ciencias Sociales & Económicas", color: "#3fa84a" },
  humanidades: { id: "humanidades", nombre: "Comunicación & Humanidades", color: "#a3c316" },
  sello: { id: "sello", nombre: "Competencias Transversales Sello", color: "#e07fb0" },
  electivos: { id: "electivos", nombre: "Electivos", color: "#8e5bb5" },
};

// Clasificación aproximada por nombre: el dataset no trae el área de formación de cada asignatura.
function areaRamo(nombre: string): Area {
  const n = nombre.toLowerCase();
  if (/^electivo/.test(n)) return AREAS.electivos!;
  if (/educación física|deportes|responsabilidad social|acción comunitaria/.test(n)) return AREAS.sello!;
  if (/comunicación|análisis crítico|expresión oral|humanístico|inglés|historia de la construcción/.test(n)) return AREAS.humanidades!;
  if (/administraci|econom|gestión|emprendimiento|innovación|legislaci|regulaci|licitaci|financier|inmobiliari|tasaci|sociedad|sustentabilidad/.test(n)) return AREAS.sociales!;
  if (/física|calor|ondas|magnetismo|cálculo|álgebra|ecuaciones diferenciales|química|matemática|geometría|probabilidad/.test(n)) return AREAS.basicas!;
  if (/programaci|estructura de datos|estadístic|optimización|investigación de operaciones|computaci|ciencia de datos|geomática|geología|sistemas dinámicos|resistencia|fluid|mecánica de/.test(n)) return AREAS.ingenieria!;
  return AREAS.especialidad!;
}

function BotonCopiar() {
  const [estado, setEstado] = useState<"" | "ok" | "error">("");
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setEstado("ok");
    } catch {
      setEstado("error");
    }
    setTimeout(() => setEstado(""), 2500);
  };
  return (
    <div className="flex items-center gap-3">
      <button type="button" className="btn btn-ghost" onClick={copiar}>Copiar enlace</button>
      <span role="status" aria-live="polite" className="text-sm font-medium">
        {estado === "ok" && <span className="text-success">¡Enlace copiado!</span>}
        {estado === "error" && <span className="text-destructive">No se pudo copiar. Copia la dirección del navegador.</span>}
      </span>
    </div>
  );
}

function Ficha() {
  const base = Route.useLoaderData();
  const variantes = carreras
    .filter((x) => x.nombre === base.nombre)
    .sort((a, b) => ordenSede(campusDe(a)[0] ?? "") - ordenSede(campusDe(b)[0] ?? ""));
  const c = variantes.find((v) => v.perfilEgreso) ?? base;
  const conMalla = variantes.find((v) => v.malla) ?? c;
  const malla = mallaDiezColumnas(conMalla.malla);
  return (
    <Layout>
      <div className="mx-auto max-w-[110rem] px-4 py-6 2xl:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to="/carreras" search={{ q: "" }} className="btn btn-back">← Volver a carreras</Link>
          <BotonCopiar />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-primary md:text-3xl">{base.nombre}</h1>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)]">
          <div>
            <dl className="card-box grid grid-cols-2 gap-4 bg-[color-mix(in_oklab,var(--primary)_14%,white)] p-4">
              <Dato k="Título" v={c.titulo} />
              <Dato k="Grado" v={c.grado} />
              <Dato k="Duración" v={c.duracion} />
              <Dato k="Régimen" v={c.regimen} />
              <Dato k="Área" v={c.area} />
              <Dato k="Pruebas" v={requiereM2(c) ? "Exige M2" : "No exige M2"} />
            </dl>
            <section className="mt-6">
              <h2 className="text-xl font-bold">Perfil de egreso</h2>
              <p className="mt-2 whitespace-pre-line text-justify text-lg leading-relaxed hyphens-auto" lang="es">{c.perfilEgreso || <NoDisponible />}</p>
            </section>
          </div>

          <section aria-labelledby="sedes">
            <h2 id="sedes" className="text-xl font-bold">
              {variantes.length > 1 ? `Se imparte en ${variantes.length} sedes/campus` : "Sede/Campus y puntajes"}
            </h2>
            <div className="mt-3 grid gap-4">
              {variantes.map((v) => (
                <article key={v.codigoDemre} className="card-box flex flex-col border-t-4 border-t-accent bg-[color-mix(in_oklab,var(--primary)_14%,white)] p-4">
                  <h3 className="font-sans text-base font-bold text-primary">{campusDe(v).join(", ")}</h3>
                  <p className="text-sm text-muted-foreground">Código DEMRE {v.codigoDemre}</p>
                  <p className="mt-3 text-sm text-muted-foreground">Mínimo de selección 2027</p>
                  <p className="font-display text-3xl font-bold text-primary">{v.minimoSeleccion2027 ?? <NoDisponible />}</p>
                  <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Máximo selección</dt><dd className="text-right font-medium">{v.maximoSeleccion2027 ?? "—"}</dd>
                    <dt className="text-muted-foreground">Ponderado mínimo para postular</dt><dd className="text-right font-medium">{v.puntajePonderadoMinimo ?? "—"}</dd>
                    <dt className="text-muted-foreground">Vacantes DEMRE</dt><dd className="text-right font-medium">{v.vacantes2027 ?? "—"}</dd>
                    <dt className="text-muted-foreground">Cupos Mujeres Científicas</dt><dd className="text-right font-medium">{v.mc2027 ?? "—"}</dd>
                    <dt className="text-muted-foreground">Arancel</dt><dd className="text-right font-medium">{formatoArancel(v.arancel)}</dd>
                  </dl>
                  <Link to="/simulador" search={{ carrera: v.codigoDemre }} className="btn mt-4 w-full">Simular mi puntaje aquí</Link>
                </article>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Los cupos Mujeres Científicas son vacantes adicionales y se suman a las vacantes DEMRE.</p>
          </section>
        </div>

        <section className="mt-6">
          <h2 className="text-xl font-bold">Malla curricular</h2>
          <div className="mt-3 overflow-x-auto pb-2" tabIndex={0} aria-label="Malla por semestre, desplazable">
            <div className="grid w-max grid-cols-[repeat(10,9.5rem)] gap-3">
              {malla.map((ramos, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <h3 className="rounded bg-primary px-2 py-1.5 text-center font-sans text-xs font-bold text-primary-foreground">Semestre {i + 1}</h3>
                  <ul className="flex flex-col gap-2">
                    {ramos.length === 0 && <li className="ramo ramo-vacio">Sin datos</li>}
                    {ramos.map((r, j) => (
                      <li key={j} className="ramo" style={{ "--area": areaRamo(r).color } as React.CSSProperties} title={r}>
                        <span className="line-clamp-4">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-base text-foreground">
            {Object.values(AREAS).map((a) => (
              <span key={a.id} className="inline-flex items-center gap-2">
                <span className="ramo-leyenda" style={{ "--area": a.color } as React.CSSProperties} />{a.nombre}
              </span>
            ))}
          </p>
        </section>
      </div>
    </Layout>
  );
}
