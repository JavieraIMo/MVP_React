import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type KeyboardEvent } from "react";
import { Layout } from "@/components/app/Layout";
import { carreras, reglas } from "@/lib/datos";
import { requiereM2 } from "@/lib/puntaje";
import { guardarSimulacion, leerSimulacion } from "@/lib/simulacion";

export const Route = createFileRoute("/simulador/")({
  validateSearch: (s: Record<string, unknown>): { carrera?: string | undefined } => ({ carrera: s["carrera"] != null && s["carrera"] !== "" ? String(s["carrera"]) : undefined }),
  head: () => ({
    meta: [
      { title: "Simulador de puntaje — Admisión USM 2027" },
      { name: "description", content: "Ingresa tus puntajes y compáralos con el mínimo de selección 2027 de hasta 20 carreras USM." },
      { property: "og:title", content: "Simulador de puntaje USM" },
      { property: "og:description", content: "Calcula tu ponderado con las ponderaciones USM." },
    ],
  }),
  component: Simulador,
});

type Campo = "nem" | "ranking" | "lectora" | "m1" | "m2" | "ciencias" | "historia";
const { min, max } = reglas.escala;

const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function BuscadorPreferencias({ disponibles, lleno, onAgregar }: { disponibles: typeof carreras; lleno: boolean; onAgregar: (cod: string) => void }) {
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const terminos = normalizar(q).split(/\s+/).filter(Boolean);
  const lista = disponibles.filter((c) => {
    const texto = normalizar(`${c.nombre} ${c.campus} ${c.codigoDemre}`);
    return terminos.every((t) => texto.includes(t));
  });

  const elegir = (cod: string) => {
    onAgregar(cod);
    setQ("");
    setActivo(0);
  };

  const teclas = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAbierto(true); setActivo((a) => Math.min(a + 1, lista.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActivo((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && abierto && lista[activo]) { e.preventDefault(); elegir(lista[activo]!.codigoDemre); }
    else if (e.key === "Escape") setAbierto(false);
  };

  return (
    <div className="relative">
      <label htmlFor="add" className="sr-only">Buscar y agregar carrera</label>
      <input
        id="add"
        type="text"
        role="combobox"
        aria-expanded={abierto && !lleno}
        aria-controls="lista-carreras"
        aria-autocomplete="list"
        autoComplete="off"
        className="field"
        placeholder={lleno ? "Llegaste al máximo de preferencias" : "Escribe una carrera o código DEMRE para agregarla…"}
        disabled={lleno}
        value={q}
        onChange={(e) => { setQ(e.target.value); setActivo(0); setAbierto(true); }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onKeyDown={teclas}
      />
      {abierto && !lleno && (
        <ul id="lista-carreras" role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-card shadow-lg">
          {lista.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">Ninguna carrera coincide con «{q}».</li>}
          {lista.map((c, i) => (
            <li
              key={c.codigoDemre}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(e) => { e.preventDefault(); elegir(c.codigoDemre); }}
              onMouseEnter={() => setActivo(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${i === activo ? "bg-secondary" : ""}`}
            >
              {c.nombre} <span className="text-muted-foreground">({c.campus}) · {c.codigoDemre}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Simulador() {
  const { carrera } = Route.useSearch();
  const nav = useNavigate();
  const [v, setV] = useState<Record<Campo, string>>({ nem: "", ranking: "", lectora: "", m1: "", m2: "", ciencias: "", historia: "" });
  const [prefs, setPrefs] = useState<string[]>(carrera ? [carrera] : []);

  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const s = leerSimulacion();
    if (!s) return;
    const p = s.puntajes;
    const t = (n: number | null) => (n == null ? "" : String(n));
    setV({ nem: t(p.nem), ranking: t(p.ranking), lectora: t(p.lectora), m1: t(p.m1), m2: t(p.m2), ciencias: t(p.ciencias), historia: t(p.historia) });
    setPrefs((cur) => [...new Set([...cur, ...s.preferencias])].slice(0, reglas.maxPreferencias));
  }, []);

  const necesitaM2 = prefs.some((cod) => {
    const c = carreras.find((x) => x.codigoDemre === cod);
    return c ? requiereM2(c) : false;
  });

  const mover = (i: number, d: number) => {
    const n = [...prefs];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j]!, n[i]!];
    setPrefs(n);
  };

  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const req: Campo[] = ["nem", "ranking", "lectora", "m1", ...(necesitaM2 ? (["m2"] as Campo[]) : [])];
    for (const k of Object.keys(v) as Campo[]) {
      const n = num(v[k]);
      if (req.includes(k) && n === null) return setErr("Completa todos los puntajes obligatorios.");
      if (n !== null && (Number.isNaN(n) || n < min || n > max)) return setErr(`Los puntajes deben estar entre ${min} y ${max}.`);
    }
    if (prefs.length === 0) return setErr("Agrega al menos una carrera.");
    setErr(null);
    guardarSimulacion({
      puntajes: { nem: num(v.nem)!, ranking: num(v.ranking)!, lectora: num(v.lectora)!, m1: num(v.m1)!, m2: necesitaM2 ? num(v.m2) : null, ciencias: num(v.ciencias), historia: num(v.historia) },
      preferencias: prefs,
    });
    nav({ to: "/simulador/resultados" });
  };

  const input = (k: Campo, label: string, opcional = false) => (
    <div className="grid items-center gap-1 sm:grid-cols-[minmax(0,1fr)_7rem] sm:gap-4">
      <label htmlFor={k} className="whitespace-nowrap text-sm font-medium">
        {label}{opcional ? <span className="text-muted-foreground"> · opcional</span> : <span className="text-destructive" aria-hidden="true"> *</span>}
      </label>
      <input
        id={k}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        required={!opcional}
        autoFocus={k === "nem"}
        aria-invalid={err != null && !opcional && v[k].trim() === ""}
        className="field w-28"
        value={v[k]}
        onChange={(e) => setV({ ...v, [k]: e.target.value })}
      />
    </div>
  );

  const disponibles = carreras.filter((c) => !prefs.includes(c.codigoDemre));

  return (
    <Layout>
      <form onSubmit={enviar} className="mx-auto max-w-7xl px-4 py-6 sm:px-8" noValidate>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Simulador de puntaje</h1>
            <p className="mt-1 text-sm text-muted-foreground">Los campos con <span className="text-destructive">*</span> son obligatorios. Se usa la mejor prueba entre Ciencias e Historia.</p>
          </div>
          <Link to="/" className="btn btn-back shrink-0">Volver al inicio</Link>
        </div>

        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <fieldset className="card-box bg-[color-mix(in_oklab,var(--primary)_26%,white)] p-4">
          <legend className="seccion-titulo">1. Carreras por orden de preferencia ({prefs.length}/{reglas.maxPreferencias})</legend>
          <BuscadorPreferencias disponibles={disponibles} lleno={prefs.length >= reglas.maxPreferencias} onAgregar={(cod) => { if (!prefs.includes(cod) && prefs.length < reglas.maxPreferencias) setPrefs([...prefs, cod]); }} />
          <ol className="mt-3 space-y-2">
            {prefs.map((cod, i) => {
              const c = carreras.find((x) => x.codigoDemre === cod);
              return (
                <li key={cod} className="flex items-center gap-2 rounded-md border bg-card p-2">
                  <span className="w-6 text-center font-bold text-primary">{i + 1}</span>
                  <span className="flex-1 text-sm">
                    <span className="font-medium">{c?.nombre ?? cod}</span>
                    {c && <span className="ml-1 text-muted-foreground">· {c.campus} · {c.codigoDemre}</span>}
                    {c && requiereM2(c) && <span className="ml-1 text-xs text-muted-foreground">(M2)</span>}
                  </span>
                  <button type="button" className="btn btn-ghost px-2 py-1" aria-label={`Subir ${c?.nombre}`} onClick={() => mover(i, -1)}>↑</button>
                  <button type="button" className="btn btn-ghost px-2 py-1" aria-label={`Bajar ${c?.nombre}`} onClick={() => mover(i, 1)}>↓</button>
                  <button type="button" className="btn btn-ghost px-2 py-1 border-destructive font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground" aria-label={`Quitar ${c?.nombre}`} onClick={() => setPrefs(prefs.filter((p) => p !== cod))}>✕</button>
                </li>
              );
            })}
          </ol>
        </fieldset>

        <fieldset className="card-box grid gap-4 bg-[color-mix(in_oklab,var(--primary)_26%,white)] p-4">
          <legend className="seccion-titulo">2. Tus puntajes</legend>
          <p className="text-sm text-muted-foreground">Cada puntaje va entre {min} y {max} puntos.</p>
          {input("nem", "NEM")}
          {input("ranking", "Ranking")}
          {input("lectora", "Competencia Lectora")}
          {input("m1", "Matemática M1")}
          {necesitaM2 && input("m2", "Matemática M2")}
          {necesitaM2 && <p className="text-sm text-muted-foreground">M2 es obligatoria para al menos una de las carreras elegidas.</p>}
          {input("ciencias", "Ciencias", true)}
          {input("historia", "Historia y Ciencias Sociales", true)}
        </fieldset>
        </div>

        {err && <p role="alert" className="mt-4 rounded-md bg-destructive px-3 py-2 text-destructive-foreground">{err}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className="btn btn-accent">Ver resultados</button>
          <Link to="/" className="btn btn-ghost">Cancelar</Link>
        </div>
      </form>
    </Layout>
  );
}
