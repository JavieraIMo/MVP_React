import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout, NoDisponible, NotaReferencial, SedeBadges } from "@/components/app/Layout";
import { campusDe, carreras, formatoArancel, mallaDiezColumnas } from "@/lib/datos";
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

function Ficha() {
  const c = Route.useLoaderData();
  const malla = mallaDiezColumnas(c.malla);
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/carreras" search={{ q: "" }} className="text-sm text-primary underline">← Volver a carreras</Link>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">Código DEMRE {c.codigoDemre}</p>
        <h1 className="text-2xl font-bold text-primary md:text-3xl">{c.nombre}</h1>
        <div className="mt-2"><SedeBadges sedes={campusDe(c)} /></div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <dl className="card-box grid grid-cols-2 gap-4 p-4 lg:col-span-2">
            <Dato k="Título" v={c.titulo} />
            <Dato k="Grado" v={c.grado} />
            <Dato k="Duración" v={c.duracion} />
            <Dato k="Régimen" v={c.regimen} />
            <Dato k="Área" v={c.area} />
            <Dato k="Arancel" v={formatoArancel(c.arancel)} />
            <Dato k="Pruebas" v={requiereM2(c) ? "Exige M2" : "No exige M2"} />
          </dl>
          <div className="card-box border-t-4 border-t-accent p-4">
            <p className="text-sm text-muted-foreground">Mínimo de selección 2027</p>
            <p className="font-display text-3xl font-bold text-primary">{c.minimoSeleccion2027 ?? <NoDisponible />}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Máximo selección</dt><dd className="text-right font-medium">{c.maximoSeleccion2027 ?? "—"}</dd>
              <dt className="text-muted-foreground">Ponderado mínimo para postular</dt><dd className="text-right font-medium">{c.puntajePonderadoMinimo ?? "—"}</dd>
              <dt className="text-muted-foreground">Vacantes DEMRE</dt><dd className="text-right font-medium">{c.vacantes2027 ?? "—"}</dd>
              <dt className="text-muted-foreground">Cupos Mujeres Científicas</dt><dd className="text-right font-medium">{c.mc2027 ?? "—"}</dd>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">Los cupos Mujeres Científicas son vacantes adicionales del programa Mujeres Científicas y se suman a las vacantes DEMRE.</p>
            <Link to="/simulador" search={{ carrera: c.codigoDemre }} className="btn mt-3 w-full">Simular con esta carrera</Link>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-xl font-bold">Perfil de egreso</h2>
          <p className="mt-2 max-w-3xl whitespace-pre-line">{c.perfilEgreso || <NoDisponible />}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-bold">Malla curricular</h2>
          <div className="mt-3 overflow-x-auto pb-2" tabIndex={0} aria-label="Malla por semestre, desplazable">
            <div className="grid min-w-[1100px] grid-cols-10 gap-2">
              {malla.map((ramos, i) => (
                <div key={i} className="card-box p-2">
                  <h3 className="mb-2 rounded bg-primary px-2 py-1 text-center font-sans text-xs font-bold text-primary-foreground">Semestre {i + 1}</h3>
                  <ul className="space-y-1">
                    {ramos.length === 0 && <li className="text-xs text-muted-foreground italic">Sin datos</li>}
                    {ramos.map((r, j) => <li key={j} className="rounded bg-secondary px-2 py-1 text-xs">{r}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="mt-6"><NotaReferencial /></div>
      </div>
    </Layout>
  );
}
