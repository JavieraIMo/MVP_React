import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, NotaReferencial } from "@/components/app/Layout";
import { carreras } from "@/lib/datos";

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

function Home() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground md:max-h-[40vh]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Admisión 2027</p>
          <h1 className="mt-1 text-2xl font-bold md:text-4xl">Encuentra tu carrera en la USM</h1>
          <form
            role="search"
            className="mt-4 flex max-w-xl gap-2"
            onSubmit={(e) => { e.preventDefault(); nav({ to: "/carreras", search: { q } }); }}
          >
            <label htmlFor="q-home" className="sr-only">Buscar carrera</label>
            <input id="q-home" className="field text-foreground" placeholder="Ej: Informática, Comercial…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-accent shrink-0">Buscar</button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link to="/simulador" className="card-box block border-l-4 border-l-accent p-5 hover:bg-secondary">
            <h2 className="text-lg font-bold text-primary">Simular mi puntaje</h2>
            <p className="mt-1 text-sm text-muted-foreground">Compara tu ponderado con el mínimo de selección 2027 de hasta 20 carreras.</p>
          </Link>
          <Link to="/carreras" search={{ q: "" }} className="card-box block border-l-4 border-l-accent p-5 hover:bg-secondary">
            <h2 className="text-lg font-bold text-primary">Explorar carreras</h2>
            <p className="mt-1 text-sm text-muted-foreground">{carreras.length} carrera(s) cargadas, con malla, aranceles y código DEMRE en una ficha.</p>
          </Link>
          <Link to="/actividades" className="card-box block border-l-4 border-l-accent p-5 hover:bg-secondary">
            <h2 className="text-lg font-bold text-primary">Ver actividades</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ferias, charlas y visitas con fecha, sede y cupos a la vista.</p>
          </Link>
        </div>

        <aside className="card-box mt-6 p-4 text-sm">
          <h2 className="font-display font-semibold">Ranking institucional</h2>
          <p className="mt-1 text-muted-foreground">Información de ranking no incluida en el dataset del proyecto.</p>
        </aside>
        <div className="mt-6"><NotaReferencial /></div>
      </div>
    </Layout>
  );
}
