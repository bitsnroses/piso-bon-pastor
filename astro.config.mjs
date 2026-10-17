// @ts-check
import { defineConfig, sharpImageService } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import { hastTypography } from "./src/lib/hast-typography.mjs";

// Project site under bitsnroses.github.io (ADR-001 §7.1). The workflow sets BASE:
// "/piso-bon-pastor" for the demo, "/" once the site has its own domain.
const base = process.env.BASE || "/";

export default defineConfig({
  site: "https://proyectos.bitsnroses.com",
  base,
  trailingSlash: "ignore",
  output: "static",
  build: {
    format: "directory",
    // One inline script per page at most (viewer + folds); styles go to a file.
    inlineStylesheets: "never",
  },
  image: {
    // AVIF at 60 matches the WebP default (80) in measured sharpness at 72 % of the bytes (E9, build-notes §1).
    service: sharpImageService({ avif: { quality: 60 } }),
  },
  markdown: {
    // Sätteri, Astro 7's default processor. Smart punctuation stays on (ADR-001 §6):
    // the content has no straight quotes or double hyphens, so nothing changes today.
    processor: satteri({
      hastPlugins: [hastTypography],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
