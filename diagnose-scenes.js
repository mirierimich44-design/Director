#!/usr/bin/env node
// diagnose-scenes.js — run from /root/Director: node diagnose-scenes.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, 'server/projects');
const PUBLIC_DIR   = path.join(__dirname, 'public');

const TARGET_TEMPLATE = '161-annotation-callout';

function fileExists(relUrl) {
  if (!relUrl) return false;
  const abs = path.join(PUBLIC_DIR, relUrl.replace(/^\//, ''));
  return fs.existsSync(abs);
}

const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json'));

let totalScenes = 0;
let issues = [];

for (const file of files) {
  const project = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf-8'));
  const pid = project.id || file;

  for (const chapter of (project.chapters || [])) {
    const cid = chapter.id;
    const scenes = chapter.scenes || [];

    for (let i = 0; i < scenes.length; i++) {
      const sc = scenes[i];
      totalScenes++;

      const isTarget = sc.template === TARGET_TEMPLATE;
      const claimsRendered = sc.status === 'rendered';
      const hasUrl = !!sc.videoUrl;
      const urlExists = fileExists(sc.videoUrl);

      const broken = claimsRendered && hasUrl && !urlExists;
      const phantom = claimsRendered && !hasUrl;
      const stuck = !claimsRendered && sc.status === 'pending' && !hasUrl;

      if (isTarget || broken || phantom) {
        issues.push({
          project: project.name || pid,
          pid,
          cid,
          sceneIdx: i,
          globalIdx: sc.globalIndex ?? sc.index ?? i,
          template: sc.template || sc.type,
          status: sc.status,
          renderStatus: sc.renderStatus,
          videoUrl: sc.videoUrl || '(none)',
          urlExists,
          flags: [
            isTarget   ? '🎯 TARGET(161)'    : null,
            broken     ? '❌ MISSING FILE'    : null,
            phantom    ? '👻 NO URL'          : null,
            stuck      ? '⏳ STUCK PENDING'   : null,
          ].filter(Boolean).join(' '),
        });
      }
    }
  }
}

console.log(`\nScanned ${files.length} projects, ${totalScenes} scenes total.\n`);

if (issues.length === 0) {
  console.log('✅ No issues found.');
} else {
  console.log(`Found ${issues.length} scene(s) needing attention:\n`);
  console.log('─'.repeat(100));
  for (const s of issues) {
    console.log(`[${s.flags}]`);
    console.log(`  Project : ${s.project}`);
    console.log(`  IDs     : pid=${s.pid}  cid=${s.cid}  sceneIdx=${s.sceneIdx}  globalIdx=${s.globalIdx}`);
    console.log(`  Template: ${s.template}`);
    console.log(`  Status  : ${s.status}  renderStatus=${s.renderStatus}`);
    console.log(`  VideoUrl: ${s.videoUrl}  (exists: ${s.urlExists})`);
    console.log();
    console.log(`  ↳ Retry: POST /api/projects/${s.pid}/chapters/${s.cid}/scenes/${s.sceneIdx}/retry`);
    console.log('─'.repeat(100));
  }
}
