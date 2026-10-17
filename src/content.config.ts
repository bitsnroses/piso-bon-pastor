// Content schemas (ADR-001 §7.1). What the layout places is typed and checked at build time;
// what is read goes in the Markdown body. Visitor-facing text lives here, never in a .astro file.
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const text = z.string().min(1);
const focus = z.string().regex(/^\d{1,3}% \d{1,3}%$/, 'object-position, e.g. "50% 60%"');
const anchor = z.string().regex(/^[a-z0-9-]+$/, "anchors: lowercase, no accents (E3 §5.2)");
const point = { lat: z.number().min(41).max(42), lon: z.number().min(2).max(3) };

// Price, update date, listing URL and the portal: one place, both languages (ADR-001 §7.3).
const datos = defineCollection({
  loader: file("src/content/datos.yaml"),
  schema: z.object({
    price: z.number().int().positive(),
    updated: z.coerce.date(),
    idealista_url: z.url(),
    portal: z.object(point),
  }),
});

// Link preview (block 0) and <head>.
const paginas = defineCollection({
  loader: glob({ base: "./src/content", pattern: "*/pagina.md" }),
  schema: ({ image }) =>
    z.object({
      title: text,
      description: text,
      og_image: image(),
      og_alt: text,
    }),
});

// Header, call to action, footer, glossary and interface strings: one component each.
const comun = defineCollection({
  loader: glob({ base: "./src/content", pattern: "*/comun.md" }),
  schema: z.object({
    language_label: text,
    language_name: text,
    logo: text,
    logo_label: text,
    cta_text: text,
    cta_label: text,
    final_title: text,
    signature: text,
    updated_text: text.includes("{date}"),
    glossary: z.array(z.object({ term: text, gloss: text })).min(1),
    ui: z.object({
      viewer: text,
      close: text,
      previous: text,
      next: text,
      count: text.includes("{n}"),
      more_photos: text.includes("{title}"),
      enlarge: text,
    }),
  }),
});

const photo = (image: () => z.ZodType) =>
  z.object({
    src: image(),
    alt: text,
    caption: text.optional(),
    focus: focus.optional(),
  });

const blocks = defineCollection({
  loader: glob({ base: "./src/content", pattern: "*/[0-9]*.md" }),
  schema: ({ image }) =>
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("cover"),
        anchor,
        title: text,
        photos: z.array(photo(image)).length(2),
      }),
      z.object({
        type: z.literal("facts"),
        anchor,
        title: text,
        figures: z.array(z.object({ value: text, label: text })).length(3),
        facts: z.array(z.object({ term: text, value: text })).min(1),
      }),
      z.object({
        type: z.literal("gallery"),
        anchor,
        title: text,
        main: photo(image),
        more: z.array(photo(image)).length(4),
      }),
      z.object({
        type: z.literal("rooms"),
        anchor,
        title: text,
        rooms: z.array(photo(image).extend({ name: text, text })).min(1),
      }),
      z.object({
        type: z.literal("text"),
        anchor,
        title: text,
        level: z.union([z.literal(2), z.literal(3)]),
        quiet: z.boolean().default(false),
      }),
      z.object({
        type: z.literal("plan"),
        anchor,
        title: text,
        plan: photo(image),
      }),
      z.object({
        type: z.literal("fold"),
        anchor: anchor.optional(),
        open_with: anchor.optional(),
        title: text.optional(),
        summary: text,
        image: photo(image).optional(),
      }),
      z.object({
        type: z.literal("neighbourhood"),
        anchor,
        title: text,
        map_title: text,
        rings: z.array(z.number().int().positive()).min(1),
        ring_label: text.includes("{min}"),
        rings_note: text,
        attribution: text,
        attribution_url: z.url(),
        portal_label: text,
        labels: z.array(z.object({ text, ...point })),
        unit: text,
        points: z
          .array(
            z.object({
              name: text,
              category: text,
              icon: z.enum(["transporte", "compras", "barrio", "plaza", "parque", "salud"]),
              minutes: z.number().int().positive(),
              ...point,
            }),
          )
          .min(1),
        source: text,
      }),
      z.object({
        type: z.literal("connections"),
        anchor,
        title: text,
        unit: text,
        times: z.array(z.object({ minutes: z.number().int().positive(), destination: text, mode: text })).min(1),
        source: text,
      }),
    ]),
});

// The 404 page (E9): title, one line and the link back to the property. Not named 404.md, which the blocks pattern would take.
const errores = defineCollection({
  loader: glob({ base: "./src/content", pattern: "*/no-encontrada.md" }),
  schema: z.object({
    title: text,
    description: text,
    link_text: text,
  }),
});

export const collections = { datos, paginas, comun, blocks, errores };
