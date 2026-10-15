// Sätteri hast plugin for every Markdown block of the site.
// 1. Figure and unit joined by a no-break space (typography.mjs).
// 2. Glossary terms (L2). The author marks a term as a link to "glosa":
//      Es de [uso exclusivo](glosa) de esta vivienda
//    and the build turns it into a button with a native popover holding the gloss from
//    the glossary in comun.md OF THE SAME LANGUAGE. A marked term that is not in that
//    glossary fails the build: no fallback to another language (WDP 10-mockup §5).
import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineHastPlugin } from "satteri";
import { parse } from "yaml";
import { nbsp } from "./typography.mjs";

/** @type {Map<string, { terms: Map<string, string>, close: string }>} */
const glossaries = new Map();

/** @param {string} file */
function glossaryFor(file) {
  const dir = dirname(file);
  if (!glossaries.has(dir)) {
    const src = readFileSync(join(dir, "comun.md"), "utf8");
    const match = src.match(/^---\n([\s\S]*?)\n---/);
    if (!match) throw new Error(`No frontmatter in ${join(dir, "comun.md")}`);
    const data = parse(match[1]);
    const terms = new Map((data.glossary || []).map((/** @type {{term: string, gloss: string}} */ g) => [g.term.toLowerCase(), g.gloss]));
    glossaries.set(dir, { terms, close: data.ui.close });
  }
  return /** @type {{ terms: Map<string, string>, close: string }} */ (glossaries.get(dir));
}

/** @param {string} s */
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] || c);
/** @param {string} s */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const hastTypography = defineHastPlugin({
  name: "hast-typography",
  text(node) {
    const value = nbsp(node.value);
    if (value !== node.value) return { type: "text", value };
  },
  element: {
    filter: ["a"],
    visit(node, ctx) {
      if (node.properties?.href !== "glosa") return;
      if (!ctx.fileURL) throw new Error("Glossary term outside a content file");
      const file = fileURLToPath(ctx.fileURL);
      const label = ctx.textContent(node);
      const key = label.toLowerCase();
      const glossary = glossaryFor(file);
      const gloss = glossary.terms.get(key);
      if (!gloss) {
        throw new Error(`Glossary: "${label}" in ${basename(file)} is not in ${join(basename(dirname(file)), "comun.md")}`);
      }
      const n = (ctx.data.glossCount = /** @type {number} */ (ctx.data.glossCount || 0) + 1);
      const id = `glosa-${basename(file, ".md")}-${n}`;
      ctx.replaceNode(node, {
        type: "raw",
        value:
          `<button type="button" class="term" popovertarget="${id}">${esc(nbsp(label))}</button>` +
          `<span class="term-gloss" id="${id}" popover><strong>${esc(cap(key))}:</strong> ${esc(nbsp(gloss))} ` +
          `<button type="button" class="term-close" popovertarget="${id}" popovertargetaction="hide">${esc(glossary.close)}</button></span>`,
      });
    },
  },
});
