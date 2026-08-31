#!/usr/bin/env node
/**
 * build-gallery.mjs
 *
 * Turns full resolution source photos into the two WebP derivatives the gallery
 * page needs, and writes photography/photos.json.
 *
 * Sources live outside the repo (default ../photo-source/, override with
 * PHOTO_SOURCE). Derivatives and the manifest are committed.
 *
 * Usage:
 *   npm run gallery
 *   npm run gallery -- --force
 *   PHOTO_SOURCE=/path/to/exports npm run gallery
 */

import { readdir, readFile, writeFile, mkdir, stat, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GALLERY_DIR = path.join(REPO_ROOT, 'photography');
const META_PATH = path.join(GALLERY_DIR, 'photos.meta.json');
const MANIFEST_PATH = path.join(GALLERY_DIR, 'photos.json');
const THUMB_DIR = path.join(GALLERY_DIR, 'img', 'thumb');
const FULL_DIR = path.join(GALLERY_DIR, 'img', 'full');

const SOURCE_DIR = path.resolve(REPO_ROOT, process.env.PHOTO_SOURCE || '../photo-source/');
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff']);

const DERIVATIVES = [
  { role: 'thumb', dir: THUMB_DIR, width: 900, quality: 74, targetBytes: 90 * 1024 },
  { role: 'full', dir: FULL_DIR, width: 2000, quality: 80, targetBytes: 400 * 1024 },
];

const force = process.argv.includes('--force');

/** Fatal, user facing failure. photos.json is never written when one is thrown. */
class BuildError extends Error {}

function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function plural(n, word) {
  return n === 1 ? word : word + 's';
}

async function readMeta() {
  let raw;
  try {
    raw = await readFile(META_PATH, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new BuildError(
        'No metadata file at ' + path.relative(REPO_ROOT, META_PATH) + '\n' +
          'Create it as a JSON object keyed by source filename without extension, for example:\n' +
          '  { "kolkata-tram-01": { "alt": "A yellow tram waiting at an empty junction.", "caption": "Kolkata, 2024", "order": 10 } }'
      );
    }
    throw err;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new BuildError(path.relative(REPO_ROOT, META_PATH) + ' is not valid JSON: ' + err.message);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BuildError(path.relative(REPO_ROOT, META_PATH) + ' must contain a JSON object.');
  }
  return parsed;
}

async function readSources() {
  let entries;
  try {
    entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new BuildError(
        'Source directory not found: ' + SOURCE_DIR + '\n' +
          'Put the full resolution exports there, or point PHOTO_SOURCE at them.'
      );
    }
    throw err;
  }

  const sources = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!SOURCE_EXTENSIONS.has(ext)) continue;
    const key = path.basename(entry.name, path.extname(entry.name));
    sources.push({
      key: key,
      slug: slugify(key),
      file: path.join(SOURCE_DIR, entry.name),
      name: entry.name,
    });
  }
  sources.sort((a, b) => a.key.localeCompare(b.key));
  return sources;
}

/** Every failure mode from the brief, reported together rather than one at a time. */
function validate(sources, meta) {
  const problems = [];
  const metaKeys = new Set(Object.keys(meta));

  const bySlug = new Map();
  for (const source of sources) {
    if (!source.slug) {
      problems.push('Source file "' + source.name + '" produces an empty slug. Rename it.');
      continue;
    }
    if (bySlug.has(source.slug)) {
      problems.push(
        'Source files "' + bySlug.get(source.slug).name + '" and "' + source.name +
          '" both map to slug "' + source.slug + '". Rename one.'
      );
      continue;
    }
    bySlug.set(source.slug, source);
  }

  for (const source of sources) {
    if (!metaKeys.has(source.key)) {
      problems.push(
        'Source "' + source.name + '" has no entry in photos.meta.json (expected key "' + source.key + '").'
      );
      continue;
    }
    const entry = meta[source.key];
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      problems.push('photos.meta.json entry "' + source.key + '" must be an object.');
      continue;
    }
    if (typeof entry.alt !== 'string' || entry.alt.trim() === '') {
      problems.push('photos.meta.json entry "' + source.key + '" is missing required non-empty "alt" text.');
    }
    if (entry.caption !== undefined && typeof entry.caption !== 'string') {
      problems.push('photos.meta.json entry "' + source.key + '" has a non-string "caption".');
    }
    if (entry.order !== undefined && typeof entry.order !== 'number') {
      problems.push('photos.meta.json entry "' + source.key + '" has a non-numeric "order".');
    }
  }

  const sourceKeys = new Set(sources.map((s) => s.key));
  for (const key of metaKeys) {
    if (!sourceKeys.has(key)) {
      problems.push(
        'photos.meta.json entry "' + key + '" has no matching source file in ' + SOURCE_DIR + '.'
      );
    }
  }

  if (problems.length > 0) {
    throw new BuildError(
      'photos.meta.json and the source directory do not agree (' +
        problems.length + ' ' + plural(problems.length, 'problem') + '):\n' +
        problems.map((p) => '  - ' + p).join('\n')
    );
  }
}

async function mtimeOrNull(file) {
  try {
    return (await stat(file)).mtimeMs;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Writes one derivative. Skips when the output already exists and is newer than
 * the source, which is what makes a second run in a row a no-op.
 */
async function buildDerivative(source, spec, sourceMtime) {
  const out = path.join(spec.dir, source.slug + '.webp');
  const outMtime = await mtimeOrNull(out);

  if (!force && outMtime !== null && outMtime >= sourceMtime) {
    const [stats, metadata] = await Promise.all([stat(out), sharp(out).metadata()]);
    return { bytes: stats.size, width: metadata.width, height: metadata.height, skipped: true };
  }

  // rotate() bakes in the EXIF orientation. sharp drops all other metadata,
  // including GPS, unless withMetadata() is called, which it is not.
  const info = await sharp(source.file)
    .rotate()
    .resize({ width: spec.width, withoutEnlargement: true })
    .webp({ quality: spec.quality })
    .toFile(out);

  return { bytes: info.size, width: info.width, height: info.height, skipped: false };
}

async function main() {
  const meta = await readMeta();
  const sources = await readSources();

  if (sources.length === 0) {
    throw new BuildError(
      'No source images found in ' + SOURCE_DIR + '\n' +
        'Accepted extensions: ' + [...SOURCE_EXTENSIONS].join(', ')
    );
  }

  validate(sources, meta);

  await mkdir(THUMB_DIR, { recursive: true });
  await mkdir(FULL_DIR, { recursive: true });

  const rows = [];
  const oversized = [];
  let generated = 0;
  let skipped = 0;
  let totalBytes = 0;

  for (const source of sources) {
    const entry = meta[source.key];
    const sourceMtime = (await stat(source.file)).mtimeMs;

    let full = null;
    for (const spec of DERIVATIVES) {
      const result = await buildDerivative(source, spec, sourceMtime);
      totalBytes += result.bytes;
      if (result.skipped) skipped += 1;
      else generated += 1;
      if (result.bytes > spec.targetBytes) {
        oversized.push(
          source.slug + ' ' + spec.role + ' is ' + formatBytes(result.bytes) +
            ', over the ' + formatBytes(spec.targetBytes) + ' target'
        );
      }
      if (spec.role === 'full') full = result;
    }

    const record = { slug: source.slug, w: full.width, h: full.height, alt: entry.alt.trim() };
    if (typeof entry.caption === 'string' && entry.caption.trim() !== '') {
      record.caption = entry.caption.trim();
    }
    rows.push({
      record: record,
      order: typeof entry.order === 'number' ? entry.order : Number.MAX_SAFE_INTEGER,
    });
  }

  rows.sort((a, b) => a.order - b.order || a.record.slug.localeCompare(b.record.slug));

  const manifest = rows.map((row) => row.record);
  const tmp = MANIFEST_PATH + '.tmp';
  await writeFile(tmp, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  await rename(tmp, MANIFEST_PATH);

  console.log('Photos:    ' + sources.length);
  console.log('Generated: ' + generated + ' ' + plural(generated, 'derivative'));
  console.log('Skipped:   ' + skipped + ' (already up to date)');
  console.log(
    'Output:    ' + formatBytes(totalBytes) + ' across ' +
      sources.length * DERIVATIVES.length + ' files'
  );
  console.log('Manifest:  ' + path.relative(REPO_ROOT, MANIFEST_PATH));

  if (oversized.length > 0) {
    console.log('');
    console.log(
      'Warning: ' + oversized.length + ' ' + plural(oversized.length, 'derivative') + ' over target size:'
    );
    for (const line of oversized) console.log('  - ' + line);
  }
}

try {
  await main();
} catch (err) {
  if (err instanceof BuildError) {
    console.error('\nbuild-gallery failed:\n' + err.message + '\n');
  } else {
    console.error('\nbuild-gallery failed:\n' + (err.stack || err.message) + '\n');
  }
  process.exit(1);
}
