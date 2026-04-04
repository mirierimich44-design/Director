#!/usr/bin/env node
// fix-scenes.js — run from /root/Director: node fix-scenes.js
// 1. Resets phantom "rendered" scenes (no videoUrl) back to "pending"
// 2. Hits retry endpoint for all 161-annotation-callout scenes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, 'server/projects');
const PUBLIC_DIR   = path.join(__dirname, 'public');
const API_BASE     = 'http://localhost:3002';
const TARGET_TEMPLATE = '161-annotation-callout';

function fileExists(relUrl) {
  if (!relUrl) return false;
  return fs.existsSync(path.join(PUBLIC_DIR, relUrl.replace(/^\//, '')));
}

const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json'));

let phantomFixed = 0;
let retried = [];

for (const file of files) {
  const filePath = path.join(PROJECTS_DIR, file);
  const project = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let dirty = false;

  for (const chapter of (project.chapters || [])) {
    for (let i = 0; i < (chapter.scenes || []).length; i++) {
      const sc = chapter.scenes[i];

      // Fix 1: phantom rendered — no videoUrl but status=rendered
      const isPhantom = sc.status === 'rendered' && !sc.videoUrl;
      if (isPhantom) {
        console.log(`  🔄 Resetting phantom: ${project.name} / scene ${sc.globalIndex ?? i} (${sc.template || sc.type})`);
        sc.status = 'pending';
        sc.renderStatus = 'idle';
        sc.error = null;
        dirty = true;
        phantomFixed++;
      }

      // Fix 2: 161 template scenes — need code regenerated via retry endpoint
      if (sc.template === TARGET_TEMPLATE) {
        retried.push({ pid: project.id, cid: chapter.id, idx: i, globalIdx: sc.globalIndex ?? i });
      }
    }
  }

  if (dirty) {
    project.updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
    console.log(`  💾 Saved ${file}`);
  }
}

console.log(`\n✅ Reset ${phantomFixed} phantom scenes to pending.\n`);

// Hit retry endpoint for all 161 scenes
if (retried.length === 0) {
  console.log('No 161-annotation-callout scenes found to retry.');
} else {
  console.log(`Hitting retry for ${retried.length} × 161-annotation-callout scene(s)...\n`);
  for (const { pid, cid, idx, globalIdx } of retried) {
    const url = `${API_BASE}/api/projects/${pid}/chapters/${cid}/scenes/${idx}/retry`;
    try {
      const res = await fetch(url, { method: 'POST' });
      const body = await res.json();
      if (body.success) {
        console.log(`  ✅ Scene globalIdx=${globalIdx} — code regenerated OK`);
      } else {
        console.log(`  ❌ Scene globalIdx=${globalIdx} — ${body.error}`);
      }
    } catch (e) {
      console.log(`  ❌ Scene globalIdx=${globalIdx} — fetch failed: ${e.message}`);
    }
  }
}

console.log('\nDone. Now click "Render All" in the UI — phantom scenes will be picked up.');
