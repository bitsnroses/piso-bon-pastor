import { getEntry, getCollection, type CollectionEntry } from "astro:content";

/** Internal URL that respects the base ("/piso-bon-pastor" in the demo, "/" with a domain). */
export function url(path = "/"): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type Lang = "es";

// Route map by language (ADR-001 §7.2). Catalan comes after the first publication: add "ca" to
// Lang and to PUBLISHED when src/content/ca/ exists. Until then the switcher is not painted (E3 §3).
export const ROUTES: Record<string, string> = { es: "/", ca: "/ca/" };
export const PUBLISHED: Lang[] = ["es"];

export async function loadPage(lang: Lang) {
  const datos = await getEntry("datos", "piso");
  const pagina = await getEntry("paginas", `${lang}/pagina`);
  const comun = await getEntry("comun", `${lang}/comun`);
  if (!datos || !pagina || !comun) throw new Error(`Missing datos, pagina or comun for ${lang}`);
  const all = await getCollection("blocks", (b) => b.id.startsWith(`${lang}/`));
  const byName = new Map(all.map((b) => [b.id.slice(lang.length + 1), b]));
  /** A block by its file name without extension, e.g. "05-azotea". Fails the build if missing. */
  function block<T extends CollectionEntry<"blocks">["data"]["type"]>(name: string, type: T) {
    const b = byName.get(name);
    if (!b) throw new Error(`Missing block ${lang}/${name}.md`);
    if (b.data.type !== type) throw new Error(`${lang}/${name}.md is "${b.data.type}", expected "${type}"`);
    return b as CollectionEntry<"blocks"> & { data: Extract<CollectionEntry<"blocks">["data"], { type: T }> };
  }
  return { datos: datos.data, pagina: pagina.data, comun, block };
}

export const locales: Record<string, string> = { es: "es-ES", ca: "ca-ES" };

export function formatPrice(n: number, lang: Lang) {
  return new Intl.NumberFormat(locales[lang], { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export function formatDate(d: Date, lang: Lang) {
  return new Intl.DateTimeFormat(locales[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(d);
}
