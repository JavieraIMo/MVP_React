import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout, SedeBadge } from "@/components/app/Layout";
import { actividades, formatoFecha } from "@/lib/datos";

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

function Detalle() {
  const a = Route.useLoaderData();
  return (
    <Layout>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[1fr_280px]">
        <div>
          <Link to="/actividades" className="text-sm text-primary underline">← Volver a actividades</Link>
          <h1 className="mt-2 text-2xl font-bold text-primary">{a.titulo}</h1>
          <dl className="card-box mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 p-4">
            <dt className="text-muted-foreground">Fecha</dt><dd className="font-semibold">{formatoFecha(a.inicio, a.fin)}</dd>
            <dt className="text-muted-foreground">Sede</dt><dd><SedeBadge sede={a.sede} /></dd>
            <dt className="text-muted-foreground">Modalidad</dt><dd>{a.modalidad}</dd>
            <dt className="text-muted-foreground">Organizador</dt><dd>{a.organizador}</dd>
            <dt className="text-muted-foreground">Cupos</dt><dd>{a.cupos ?? "Sin límite informado"}</dd>
          </dl>
          {a.descripcion && <p className="mt-4">{a.descripcion}</p>}
          {a.enlace && <a href={a.enlace} target="_blank" rel="noreferrer" className="btn mt-4">Inscribirme</a>}
        </div>
        {a.afiche && (
          <figure>
            <img src={a.afiche} alt={a.afícheAlt ?? `Afiche de ${a.titulo}`} className="w-full rounded-md border" />
            <figcaption className="mt-1 text-xs text-muted-foreground">Afiche referencial. Los datos oficiales están en el texto.</figcaption>
          </figure>
        )}
      </div>
    </Layout>
  );
}
