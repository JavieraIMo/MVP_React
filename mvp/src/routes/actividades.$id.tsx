import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/app/Layout";
import { actividades, formatoFecha, normalizarSede } from "@/lib/datos";

export const Route = createFileRoute("/actividades/$id")({
  loader: ({ params }) => {
    const a = actividades.find((x) => x.id === params.id);
    if (!a) throw notFound();
    return a;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.titulo} — Actividades USM` : "Actividad — Admisión USM" },
      { name: "description", content: "Detalle de actividad USM: fecha, sede, modalidad, organizador y cupos." },
      { property: "og:title", content: loaderData?.titulo ?? "Actividad USM" },
      { property: "og:description", content: "Detalle de actividad de Admisión USM 2027." },
    ],
  }),
  component: Detalle,
});

function Fila({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-dashed py-2 last:border-0">
      <dt className="text-sm font-bold text-primary">{k}:</dt>
      <dd className="mt-0.5 break-words">{children}</dd>
    </div>
  );
}

function Detalle() {
  const a = Route.useLoaderData();
  const online = normalizarSede(a.sede) === "Online";
  const horaInicio = a.inicio.includes("T") ? a.inicio.slice(11, 16) : null;
  const fechaInicio = formatoFecha(a.inicio.slice(0, 10));
  const fechaFin = a.fin && a.fin.slice(0, 10) !== a.inicio.slice(0, 10) ? formatoFecha(a.fin.slice(0, 10)) : null;
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/actividades" className="btn btn-back">← Volver a actividades</Link>
        <h1 className="mt-3 max-w-4xl text-2xl font-bold text-primary md:text-3xl">{a.titulo}</h1>

        <div className="mt-4 grid gap-x-3 gap-y-2 rounded-md bg-primary p-4 text-primary-foreground sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm opacity-90">{fechaFin ? "Fechas:" : "Fecha:"}</p>
            <p className="text-lg font-bold">{fechaFin ? `${fechaInicio} – ${fechaFin}` : fechaInicio}</p>
          </div>
          {horaInicio && (
            <div>
              <p className="text-sm opacity-90">Horario:</p>
              <p className="text-lg font-bold">{horaInicio}{a.horaFin ? ` – ${a.horaFin}` : ""} h</p>
            </div>
          )}
          <div>
            <p className="text-sm opacity-90">Sede/Campus:</p>
            <p className="text-lg font-bold">{online ? "No aplica" : normalizarSede(a.sede)}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Modalidad:</p>
            <p className="text-lg font-bold">{a.modalidad}</p>
          </div>
        </div>

        <div className={`mt-6 grid gap-6 ${a.afiche ? "md:grid-cols-[26rem_minmax(0,1fr)]" : ""}`}>
          {a.afiche && (
            <figure>
              <img src={a.afiche} alt={a.afícheAlt ?? `Imagen de ${a.titulo}`} className="w-full rounded-md border" />
            </figure>
          )}
          <div>
            {a.descripcion && <div className="max-w-prose space-y-3 whitespace-pre-line">{a.descripcion}</div>}
            {a.enlace && <a href={a.enlace} target="_blank" rel="noreferrer" className="btn btn-accent mt-4">Inscribirme</a>}
          </div>
        </div>

        <section aria-labelledby="mas-datos" className="card-box mt-6 p-4">
          <h2 id="mas-datos" className="text-lg font-bold">Más datos</h2>
          <dl className="mt-2 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {a.lugar && <Fila k="Lugar">{a.lugar}</Fila>}
            {a.publico && <Fila k="Público">{a.publico}</Fila>}
            {a.tematica && <Fila k="Temática">{a.tematica}</Fila>}
            <Fila k="Organizador">{a.organizador}</Fila>
            {a.cupos != null && <Fila k="Cupos">{a.cupos}</Fila>}
            {a.contacto && <Fila k="Consultas a">{a.contacto}</Fila>}
          </dl>
        </section>
      </div>
    </Layout>
  );
}
