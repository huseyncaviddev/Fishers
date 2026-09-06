// Regenerates src/data/galleryImages.ts from the images on disk.
// Run from the project root:  node scripts/gen-gallery.mjs
//
// PRIORITY lists the tiles that must lead the gallery, in order; every other
// image in public/images/improved is appended after them (sorted by name).
// CATEGORY maps each file to a gallery filter bucket (farm/processing/tech/
// moments); anything unmapped falls back to DEFAULT_CATEGORY. Natural pixel
// dimensions are read with sharp so the masonry reserves space (no layout shift).

import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PUB = "./public/images";
const IMPROVED = path.join(PUB, "improved");
const DEFAULT_CATEGORY = "farm";

const dims = async (file) => {
  const m = await sharp(file).metadata();
  return { w: m.width, h: m.height };
};

// `root:true` => file lives in /public/images directly, else in improved/.
const PRIORITY = [
  { f: "ChatGPT Image Sep 6, 2026, 04_13_40 PM.png" },
  { f: "ChatGPT Image Sep 6, 2026, 04_15_13 PM.png" },
  { f: "1.jpg", root: true },
  { f: "ChatGPT Image Sep 6, 2026, 04_21_26 PM.png" },
  { f: "ChatGPT Image Sep 6, 2026, 05_01_19 PM.png" },
  { f: "ChatGPT Image Sep 6, 2026, 04_42_50 PM.png" },
  { f: "ChatGPT Image Sep 6, 2026, 04_44_13 PM.png" },
  { f: "ChatGPT Image Sep 6, 2026, 03_59_53 PM.png" },
  { f: "017_1440437178083821.png" },
  { f: "ChatGPT Image Sep 6, 2026, 02_46_16 PM.png" },
  { f: "ChatGPT Image Sep 6, 2026, 02_58_30 PM (2).png" },
  { f: "ChatGPT Image Sep 6, 2026, 03_22_47 PM (2).png" },
];

// Category per image (by file name), assigned from the actual photo content.
const CATEGORY = {
  // processing — sorting, grading, caviar product
  "ChatGPT Image Sep 6, 2026, 04_13_40 PM.png": "processing",
  "ChatGPT Image Sep 6, 2026, 02_46_16 PM.png": "processing",
  "ChatGPT Image Sep 6, 2026, 02_51_20 PM (3).png": "processing",
  "ChatGPT Image Sep 6, 2026, 04_10_54 PM.png": "processing",
  "ChatGPT Image Sep 6, 2026, 05_31_19 PM.png": "processing",
  // tech — labs, microscopes, measuring, water treatment, monitoring
  "ChatGPT Image Sep 6, 2026, 04_15_13 PM.png": "tech",
  "ChatGPT Image Sep 6, 2026, 02_51_19 PM (1).png": "tech",
  "ChatGPT Image Sep 6, 2026, 02_51_19 PM (2).png": "tech",
  "ChatGPT Image Sep 6, 2026, 02_51_20 PM (4).png": "tech",
  "ChatGPT Image Sep 6, 2026, 02_51_20 PM (5).png": "tech",
  "ChatGPT Image Sep 6, 2026, 03_22_47 PM (1).png": "tech",
  "ChatGPT Image Sep 6, 2026, 03_22_48 PM (4).png": "tech",
  "ChatGPT Image Sep 6, 2026, 03_22_48 PM (5).png": "tech",
  "ChatGPT Image Sep 6, 2026, 03_57_14 PM.png": "tech",
  "ChatGPT Image Sep 6, 2026, 05_27_13 PM.png": "tech",
  // moments — people, teams, events, exhibitions, ceremonies, meals
  "ChatGPT Image Sep 6, 2026, 05_01_19 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_59_53 PM.png": "moments",
  "017_1440437178083821.png": "moments",
  "ChatGPT Image Sep 6, 2026, 02_58_30 PM (2).png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_22_47 PM (2).png": "moments",
  "ChatGPT Image Sep 6, 2026, 02_58_30 PM (1).png": "moments",
  "ChatGPT Image Sep 6, 2026, 02_58_30 PM (3).png": "moments",
  "ChatGPT Image Sep 6, 2026, 02_58_31 PM (5).png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_22_47 PM (3).png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_33_40 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_50_30 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_51_16 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_52_35 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_53_42 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_54_57 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 03_56_14 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 04_04_17 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 04_09_24 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 04_41_28 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 05_03_41 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 05_05_36 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 05_06_53 PM.png": "moments",
  "ChatGPT Image Sep 6, 2026, 05_11_04 PM.png": "moments",
  // farm — tanks, ponds, cages, sturgeon rearing, fish (everything else)
  "1.jpg": "farm",
  "ChatGPT Image Sep 6, 2026, 04_21_26 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 04_42_50 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 04_44_13 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 02_58_31 PM (4).png": "farm",
  "ChatGPT Image Sep 6, 2026, 03_35_55 PM (1).png": "farm",
  "ChatGPT Image Sep 6, 2026, 03_35_56 PM (2).png": "farm",
  "ChatGPT Image Sep 6, 2026, 03_35_56 PM (3).png": "farm",
  "ChatGPT Image Sep 6, 2026, 03_35_56 PM (4).png": "farm",
  "ChatGPT Image Sep 6, 2026, 03_35_57 PM (5).png": "farm",
  "ChatGPT Image Sep 6, 2026, 03_49_39 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 03_58_06 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 04_02_49 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 04_06_45 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 04_12_04 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 05_26_04 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 05_28_56 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 05_30_02 PM.png": "farm",
  "ChatGPT Image Sep 6, 2026, 05_32_55 PM.png": "farm",
};

const catOf = (basename) => CATEGORY[basename] ?? DEFAULT_CATEGORY;

const usedImproved = new Set(PRIORITY.filter((p) => !p.root).map((p) => p.f));
const allImproved = (await readdir(IMPROVED)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
const rest = allImproved.filter((f) => !usedImproved.has(f)).sort();

const items = [];
for (const p of PRIORITY) {
  const abs = p.root ? path.join(PUB, p.f) : path.join(IMPROVED, p.f);
  const src = p.root ? `/images/${p.f}` : `/images/improved/${p.f}`;
  items.push({ src, category: catOf(p.f), ...(await dims(abs)) });
}
for (const f of rest) {
  items.push({ src: `/images/improved/${f}`, category: catOf(f), ...(await dims(path.join(IMPROVED, f))) });
}

const body = `// AUTO-GENERATED by scripts/gen-gallery.mjs — do not edit by hand.
// Showcase images for the gallery page, in display order. Dimensions are the
// images' natural pixel sizes, used to reserve masonry space (no layout shift).

export type GalleryCategory = "farm" | "processing" | "tech" | "moments";

export interface GalleryImage {
  src: string;
  category: GalleryCategory;
  w: number;
  h: number;
}

export const GALLERY_IMAGES: GalleryImage[] = [
${items.map((i) => `  { src: ${JSON.stringify(i.src)}, category: ${JSON.stringify(i.category)}, w: ${i.w}, h: ${i.h} },`).join("\n")}
];
`;

await writeFile("./src/data/galleryImages.ts", body, "utf8");
const counts = items.reduce((a, i) => ((a[i.category] = (a[i.category] || 0) + 1), a), {});
console.log(`Wrote ${items.length} images to src/data/galleryImages.ts`, counts);
