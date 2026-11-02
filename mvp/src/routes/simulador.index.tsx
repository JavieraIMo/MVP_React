import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

function Simulador() {
  const { carrera } = Route.useSearch();
  const nav = useNavigate();
  const [v, setV] = useState<Record<Campo, string>>({ nem: "", ranking: "", lectora: "", m1: "", m2: "", ciencias: "", historia: "" });
  const [prefs, setPrefs] = useState<string[]>(carrera ? [carrera] : []);
  const [sel, setSel] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const s = leerSimulacion();
    if (!s) return;
    const p = s.puntajes;
    const t = (n: number | null) => (n == null ? "" : String(n));
    setV({ nem: t(p.nem), ranking: t(p.ranking), lectora: t(p.lectora), m1: t(p.m1), m2: t(p.m2), ciencias: t(p.ciencias), historia: t(p.historia) });
    setPrefs((cur) => [...new Set([...s.preferencias, ...cur])].slice(0, reglas.maxPreferencias));
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
        <h1 className="text-2xl font-bold text-primary">Simulador de puntaje</h1>
        <p className="mt-1 text-sm text-muted-foreground">Los campos con <span className="text-destructive">*</span> son obligatorios. Se usa la mejor prueba entre Ciencias e Historia.</p>

        <div className="mt-4 grid items-start gap-6 lg:grid-cols-2">
        <fieldset className="card-box p-4">
          <legend className="px-1 font-semibold">1. Carreras por orden de preferencia ({prefs.length}/{reglas.maxPreferencias})</legend>
          <div className="flex gap-2">
            <label htmlFor="add" className="sr-only">Agregar carrera</label>
            <select id="add" className="field" value={sel} onChange={(e) => setSel(e.target.value)}>
              <option value="">Selecciona una carrera…</option>
              {disponibles.map((c) => <option key={c.codigoDemre} value={c.codigoDemre}>{c.nombre} ({c.campus}) · {c.codigoDemre}</option>)}
            </select>
            <button type="button" className="btn shrink-0" disabled={!sel || prefs.length >= reglas.maxPreferencias} onClick={() => { setPrefs([...prefs, sel]); setSel(""); }}>Agregar</button>
          </div>
          <ol className="mt-3 space-y-2">
            {prefs.map((cod, i) => {
              const c = carreras.find((x) => x.codigoDemre === cod);
              return (
                <li key={cod} className="flex items-center gap-2 rounded-md bg-secondary p-2">
                  <span className="w-6 text-center font-bold text-primary">{i + 1}</span>
                  <span className="flex-1 text-sm">{c?.nombre ?? cod}{c && requiereM2(c) && <span className="ml-1 text-xs text-muted-foreground">(M2)</span>}</span>
                  <button type="button" className="btn btn-ghost px-2 py-1" aria-label={`Subir ${c?.nombre}`} onClick={() => mover(i, -1)}>↑</button>
                  <button type="button" className="btn btn-ghost px-2 py-1" aria-label={`Bajar ${c?.nombre}`} onClick={() => mover(i, 1)}>↓</button>
                  <button type="button" className="btn btn-ghost px-2 py-1" aria-label={`Quitar ${c?.nombre}`} onClick={() => setPrefs(prefs.filter((p) => p !== cod))}>✕</button>
                </li>
              );
            })}
          </ol>
        </fieldset>

        <fieldset className="card-box grid gap-4 p-4">
          <legend className="px-1 font-semibold">2. Tus puntajes</legend>
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
