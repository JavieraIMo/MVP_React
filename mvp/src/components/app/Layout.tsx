import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SEDES, normalizarSede } from "@/lib/datos";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/carreras", label: "Carreras" },
  { to: "/simulador", label: "Simulador" },
  { to: "/actividades", label: "Actividades" },
] as const;

const REDES = [
  { label: "Instagram", href: "https://www.instagram.com/usantamaria/" },
  { label: "Facebook", href: "https://www.facebook.com/usantamaria" },
  { label: "X", href: "https://x.com/usantamaria" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCr5rEvayXIC0YnJxDAWuWtQ" },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/usantamaria/" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <header className="sticky top-0 z-30 border-b-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-3 font-display text-lg font-bold leading-tight">
            <img src="/logo-usm.png" alt="Escudo de la Universidad Técnica Federico Santa María" width={44} height={40} className="h-10 w-auto shrink-0" />
            <span>Admisión USM <span className="font-normal opacity-80">· Orientador de carrera</span></span>
          </Link>
          <nav aria-label="Principal" className="-mx-1 flex w-full gap-1 overflow-x-auto sm:w-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="nav-link"
                activeProps={{ "aria-current": "page", className: "nav-link-active" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main id="contenido" className="flex-1">{children}</main>
      <footer className="mt-12 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2">
          <div>
            <p className="font-display font-bold">Redes oficiales USM</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {REDES.map((r) => (
                <li key={r.label}>
                  <a href={r.href} target="_blank" rel="noreferrer" className="footer-link">{r.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm opacity-85">
            Admisión 2027. Datos referenciales: el puntaje real depende de la tabla oficial vigente publicada por la USM y el DEMRE.
            Proyecto académico — Diseño de Interfaces Usuarias.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function SedeBadge({ sede }: { sede: string }) {
  const s = normalizarSede(sede);
  return <span className="sede-badge" data-sede={(SEDES as readonly string[]).indexOf(s)}>{s}</span>;
}

export function NotaReferencial() {
  return (
    <p role="note" className="rounded-md border-l-4 border-accent bg-secondary px-3 py-2 text-sm text-secondary-foreground">
      <strong>Datos referenciales · Admisión 2027.</strong> El puntaje real depende de la tabla oficial vigente.
    </p>
  );
}

export function ChipGroup({ label, opciones, valor, onChange }: { label: string; opciones: string[]; valor: string; onChange: (v: string) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-24 text-sm font-medium">{label}</span>
      {["", ...opciones].map((o) => (
        <button key={o || "todas"} type="button" className="chip" aria-pressed={valor === o} onClick={() => onChange(o)}>
          {o || "Todas"}
        </button>
      ))}
    </div>
  );
}

export function NoDisponible() {
  return <span className="text-muted-foreground italic">No disponible</span>;
}

export function SedeBadges({ sedes }: { sedes: string[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {sedes.map((s) => <SedeBadge key={s} sede={s} />)}
    </span>
  );
}
