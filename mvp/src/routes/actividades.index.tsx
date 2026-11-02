import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChipGroup, Layout, SedeBadge } from "@/components/app/Layout";
import { actividades, formatoFecha, normalizarSede, ordenSede, SEDES, TIPOS_ACTIVIDAD } from "@/lib/datos";

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
  const [tipo, setTipo] = useState("");
  const modalidades = [...new Set(actividades.map((a) => a.modalidad))];
  const lista = actividades
    .filter((a) => (!sede || normalizarSede(a.sede) === sede) && (!mod || a.modalidad === mod) && (!tipo || a.tipo === tipo))
    .sort((a, b) => a.inicio.localeCompare(b.inicio) || ordenSede(a.sede) - ordenSede(b.sede));

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-primary">Actividades</h1>
        <div className="mt-4 space-y-3">
          <ChipGroup label="Tipo" opciones={[...TIPOS_ACTIVIDAD]} valor={tipo} onChange={setTipo} />
          <ChipGroup label="Sede/Campus" opciones={SEDES.filter((s) => s !== "Online")} valor={sede} onChange={setSede} />
          <ChipGroup label="Modalidad" opciones={modalidades} valor={mod} onChange={setMod} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{lista.length} de {actividades.length} actividades</p>
        {lista.length === 0 ? (
          <p className="card-box mt-6 p-6 text-muted-foreground">
            {actividades.length === 0 ? "Aún no hay actividades cargadas en el dataset." : "No hay actividades con estos filtros."}
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lista.map((a) => (
              <li key={a.id}>
                <Link to="/actividades/$id" params={{ id: a.id }} className="card-box lift flex h-full flex-col overflow-hidden">
                  {a.afiche ? (
                    <img src={a.afiche} alt="" loading="lazy" className="h-40 w-full object-cover object-[center_30%]" />
                  ) : (
                    <div aria-hidden="true" className="h-40 w-full bg-primary/10" />
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip-tipo">{a.tipo}</span>
                    <span className="text-sm font-bold text-primary">{formatoFecha(a.inicio, a.fin)}</span>
                  </div>
                  <span className="font-semibold leading-snug">{a.titulo}</span>
                  <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                    {normalizarSede(a.sede) !== "Online" && <SedeBadge sede={a.sede} />}
                    <span className="text-muted-foreground">{a.modalidad}</span>
                  </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
