import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout, NoDisponible, SedeBadges } from "@/components/app/Layout";
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

function tipoRamo(nombre: string) {
  if (/^electivo/i.test(nombre)) return "ramo-electivo";
  if (/^(taller|proyecto|práctica|practica|memoria|trabajo de t)/i.test(nombre)) return "ramo-taller";
  return "";
}

function Ficha() {
  const c = Route.useLoaderData();
  const malla = mallaDiezColumnas(c.malla);
  return (
    <Layout>
      <div className="mx-auto max-w-[110rem] px-4 py-6 2xl:px-8">
        <div className="max-w-6xl">
        <Link to="/carreras" search={{ q: "" }} className="btn btn-back">← Volver a carreras</Link>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">Código DEMRE {c.codigoDemre}</p>
        <h1 className="text-2xl font-bold text-primary md:text-3xl">{c.nombre}</h1>
        <div className="mt-2"><SedeBadges sedes={campusDe(c)} /></div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_28rem]">
          <dl className="card-box grid grid-cols-2 gap-4 p-4">
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
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Máximo selección</dt><dd className="text-right font-medium">{c.maximoSeleccion2027 ?? "—"}</dd>
              <dt className="text-muted-foreground">Ponderado mínimo para postular</dt><dd className="text-right font-medium">{c.puntajePonderadoMinimo ?? "—"}</dd>
              <dt className="text-muted-foreground">Vacantes DEMRE</dt><dd className="text-right font-medium">{c.vacantes2027 ?? "—"}</dd>
              <dt className="text-muted-foreground">Cupos Mujeres Científicas</dt><dd className="text-right font-medium">{c.mc2027 ?? "—"}</dd>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">Los cupos Mujeres Científicas son vacantes adicionales del programa Mujeres Científicas y se suman a las vacantes DEMRE.</p>
            <Link to="/simulador" search={{ carrera: c.codigoDemre }} className="btn mt-3 w-full">Simular mi puntaje con esta carrera</Link>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-xl font-bold">Perfil de egreso</h2>
          <p className="mt-2 max-w-3xl whitespace-pre-line">{c.perfilEgreso || <NoDisponible />}</p>
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
                      <li key={j} className={`ramo ${tipoRamo(r)}`} title={r}>
                        <span className="line-clamp-4">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-base text-foreground">
            <span className="inline-flex items-center gap-2"><span className="ramo-leyenda" />Asignatura obligatoria</span>
            <span className="inline-flex items-center gap-2"><span className="ramo-leyenda ramo-electivo" />Electivo</span>
            <span className="inline-flex items-center gap-2"><span className="ramo-leyenda ramo-taller" />Taller o proyecto</span>
          </p>
        </section>
      </div>
    </Layout>
  );
}
