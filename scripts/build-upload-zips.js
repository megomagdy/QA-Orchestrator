/**
 * Build upload-ready .zip files for every skill, for uploading to
 * Settings -> Skills (claude.ai / Desktop / mobile / Cowork).
 *
 *   node scripts/build-upload-zips.js          folder-rooted (default)
 *   node scripts/build-upload-zips.js --flat   SKILL.md at archive root
 *
 * Uses forward-slash entry paths. Do NOT use Windows Compress-Archive:
 * it writes backslash paths and the uploader rejects them as invalid.
 * Requires jszip to be resolvable (NODE_PATH or a local install).
 */
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const ROOT = path.resolve(__dirname, "..");
const SKILLS = path.join(ROOT, "skills");
const OUT = path.join(ROOT, ".upload-zips");
const flat = process.argv.includes("--flat");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const walk = (dir, base = "") =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const abs = path.join(dir, e.name);
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walk(abs, rel) : [{ abs, rel }];
  });

(async () => {
  const skills = fs.readdirSync(SKILLS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."));
  let n = 0;
  for (const s of skills) {
    const files = walk(path.join(SKILLS, s.name));
    if (!files.some((f) => f.rel.endsWith("SKILL.md"))) {
      console.log(`  SKIP (no SKILL.md): ${s.name}`);
      continue;
    }
    const zip = new JSZip();
    for (const f of files) {
      zip.file(flat ? f.rel : `${s.name}/${f.rel}`, fs.readFileSync(f.abs));
    }
    fs.writeFileSync(
      path.join(OUT, `${s.name}.zip`),
      await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", platform: "UNIX" })
    );
    n++;
  }
  console.log(`built ${n} zips (${flat ? "flat" : "folder-rooted"}) in ${OUT}`);
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
