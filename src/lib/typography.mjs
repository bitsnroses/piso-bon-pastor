// Text rules applied by the build, so the author writes plain text (ADR-002 §6.5).
// Plain .mjs so astro.config.mjs can import it without a TypeScript step.

// A figure never breaks from its unit. Closed list of units with SI prefixes:
// €, %, min, h, and m, g, s, W, Wh, V, A, F, H, Hz, l with k M G T c d m µ n p.
// The figure must not follow a letter (L9, H4) and the unit must end the word
// ("2 habitaciones" stays as it is). "40 m" before <sup>2</sup> ends the text node,
// which counts as the end of the word.
const UNIT = String.raw`(?:[kMGTcdmµμnp]?(?:Wh|Hz|m|g|s|W|V|A|F|H|l)|min|h|€|%)`;
const FIGURE_UNIT = new RegExp(String.raw`(?<![\p{L}\d])(\d[\d.,]*) (?=${UNIT}(?![\p{L}\d]))`, "gu");

/** @param {string} text */
export function nbsp(text) {
  return text.replace(FIGURE_UNIT, "$1 ");
}

const ESCAPES = /** @type {Record<string, string>} */ ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" });

/**
 * Frontmatter strings that reach the page as HTML. Everything is escaped except
 * <sup>…</sup> and <sub>…</sub>, the only markup the content allows (content/README.md §4).
 * @param {string} text
 */
export function inline(text) {
  const escaped = String(text).replace(/[&<>"]/g, (c) => ESCAPES[c]);
  return nbsp(escaped).replace(/&lt;(\/?)(sup|sub)&gt;/g, "<$1$2>");
}

/**
 * Plain text for attributes (alt, aria-label, meta): markup out, figure and unit kept together.
 * @param {string} text
 */
export function plain(text) {
  return nbsp(String(text).replace(/<sup>2<\/sup>/g, "²").replace(/<sub>2<\/sub>/g, "₂").replace(/<[^>]+>/g, ""));
}

/**
 * "{key}" placeholders in content strings.
 * @param {string} template
 * @param {Record<string, string | number>} values
 */
export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
}
