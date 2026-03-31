/**
 * projects.js — Project management for documentary production
 *
 * A Project groups all chapters, scenes, and assets for a single documentary.
 * Workflow: Create project → paste chapter → edit/render → lock → next chapter → export
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECTS_DIR = path.join(__dirname, 'projects')

// Ensure directory exists
if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true })

// ─────────────────────────────────────────────
// Project structure
// ─────────────────────────────────────────────
function createProjectData(name, description = '') {
  return {
    id: uuidv4(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',         // active | completed | archived
    chapters: [],
    totalScenes: 0,
    settings: {
      defaultTheme: 'THREAT',
      format: 'landscape',
      director: 'standard', // 'standard' | 'fiscal-pal'
    },
    generationSettings: {
      templateRatio: 60,           // % of scenes that should be TEMPLATE (vs 3D_RENDER)
      colorScheme: 'auto',         // 'auto' | 'THREAT' | 'COLD' | 'DARK' | 'INTEL' | 'TECHNICAL' | 'CLEAN' | 'custom'
      customColors: {              // only used when colorScheme === 'custom'
        primary: '#FF6600',
        background: '#0A0A0A',
        accent: '#FFAA00',
      },
      templateVariety: 'high',     // 'low' | 'medium' | 'high' — how aggressively to avoid reuse
      maxTemplateReuse: 1,         // max times a single template can appear in one chapter
      customPrompt: '',            // free-text instructions appended to Gemini system prompt
    },
  }
}

function createChapterData(title, scriptText, sceneOffset) {
  return {
    id: uuidv4(),
    title,
    scriptText,
    status: 'draft',           // draft | rendering | reviewing | locked
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sceneOffset,               // first scene number in this chapter
    scenes: [],
    notes: '',
  }
}

// ─────────────────────────────────────────────
// File I/O
// ─────────────────────────────────────────────
function projectPath(id) {
  return path.join(PROJECTS_DIR, `${id}.json`)
}

function loadProject(id) {
  const p = projectPath(id)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function saveProject(project) {
  project.updatedAt = new Date().toISOString()
  // Recalculate total scenes
  project.totalScenes = project.chapters.reduce((sum, ch) => sum + ch.scenes.length, 0)
  fs.writeFileSync(projectPath(project.id), JSON.stringify(project, null, 2))
  return project
}

// ─────────────────────────────────────────────
// Project CRUD
// ─────────────────────────────────────────────
export function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return []
  return fs.readdirSync(PROJECTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, f), 'utf8'))
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          totalScenes: data.totalScenes,
          chapterCount: data.chapters.length,
          lockedChapters: data.chapters.filter(c => c.status === 'locked').length,
        }
      } catch { return null }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export function getProject(id) {
  return loadProject(id)
}

export function createProject(name, description, settings = {}) {
  const project = createProjectData(name, description)
  if (settings) {
    project.settings = { ...project.settings, ...settings }
  }
  saveProject(project)
  console.log(`📁 Project created: "${name}" (${project.id.substring(0, 8)})`)
  return project
}

export function updateProject(id, updates) {
  const project = loadProject(id)
  if (!project) throw new Error('Project not found')

  if (updates.name !== undefined) project.name = updates.name
  if (updates.description !== undefined) project.description = updates.description
  if (updates.status !== undefined) project.status = updates.status
  if (updates.settings) project.settings = { ...project.settings, ...updates.settings }
  if (updates.generationSettings) project.generationSettings = { ...project.generationSettings, ...updates.generationSettings }

  return saveProject(project)
}

export function deleteProject(id) {
  const p = projectPath(id)
  if (fs.existsSync(p)) fs.unlinkSync(p)
}

// ─────────────────────────────────────────────
// Chapter management
// ─────────────────────────────────────────────
export function addChapter(projectId, title, scriptText, scenes = []) {
  const project = loadProject(projectId)
  if (!project) throw new Error('Project not found')

  // Calculate scene offset (continue numbering from previous chapters)
  const sceneOffset = project.chapters.reduce((sum, ch) => sum + ch.scenes.length, 0)

  const chapter = createChapterData(title, scriptText, sceneOffset)

  // Number scenes continuously
  chapter.scenes = scenes.map((scene, i) => ({
    ...scene,
    globalIndex: sceneOffset + i + 1,
    chapterIndex: i + 1,
    status: 'pending',          // pending | rendered | flagged | locked
    flag: null,                 // null | 'needs-fix' | 'needs-review' | 'approved'
    notes: '',
    renderedAt: null,
    editHistory: scene.editHistory || [],
  }))

  project.chapters.push(chapter)
  saveProject(project)

  console.log(`📁 Chapter "${title}" added to project "${project.name}" — ${chapter.scenes.length} scenes (${sceneOffset + 1}-${sceneOffset + chapter.scenes.length})`)
  return { project, chapter }
}

export function updateChapter(projectId, chapterId, updates) {
  const project = loadProject(projectId)
  if (!project) throw new Error('Project not found')

  const chapter = project.chapters.find(c => c.id === chapterId)
  if (!chapter) throw new Error('Chapter not found')

  if (updates.title !== undefined) chapter.title = updates.title
  if (updates.status !== undefined) chapter.status = updates.status
  if (updates.notes !== undefined) chapter.notes = updates.notes
  chapter.updatedAt = new Date().toISOString()

  saveProject(project)
  return { project, chapter }
}

export function updateChapterScenes(projectId, chapterId, scenes) {
  const project = loadProject(projectId)
  if (!project) throw new Error('Project not found')

  const chapter = project.chapters.find(c => c.id === chapterId)
  if (!chapter) throw new Error('Chapter not found')

  // Build a lookup of already-rendered scenes by script text so we don't
  // throw away video/image URLs when a chapter is re-analyzed.
  const renderedByScript = new Map()
  ;(chapter.scenes || []).forEach(s => {
    if (s.script && (s.videoUrl || s.imageUrl)) {
      renderedByScript.set(s.script.trim(), s)
    }
  })

  chapter.scenes = scenes.map((scene, i) => {
    const prev = renderedByScript.get((scene.script || '').trim())
    const alreadyRendered = prev && (prev.videoUrl || prev.imageUrl)
    return {
      ...scene,
      globalIndex: chapter.sceneOffset + i + 1,
      chapterIndex: i + 1,
      // Preserve render output if this exact sentence was already rendered
      status:     alreadyRendered ? prev.status     : 'pending',
      flag:       alreadyRendered ? prev.flag       : null,
      notes:      alreadyRendered ? prev.notes      : '',
      renderedAt: alreadyRendered ? prev.renderedAt : null,
      videoUrl:   alreadyRendered ? prev.videoUrl   : undefined,
      imageUrl:   alreadyRendered ? prev.imageUrl   : undefined,
      editHistory: scene.editHistory || prev?.editHistory || [],
    }
  })

  chapter.updatedAt = new Date().toISOString()

  // Recalculate scene offsets and global indices across all chapters
  // because the number of scenes in this chapter might have changed
  let offset = 0
  for (const ch of project.chapters) {
    ch.sceneOffset = offset
    ch.scenes.forEach((s, i) => {
      s.globalIndex = offset + i + 1
    })
    offset += ch.scenes.length
  }

  saveProject(project)
  return { project, chapter }
}

export function deleteChapter(projectId, chapterId) {
  const project = loadProject(projectId)
  if (!project) throw new Error('Project not found')

  const idx = project.chapters.findIndex(c => c.id === chapterId)
  if (idx === -1) throw new Error('Chapter not found')

  project.chapters.splice(idx, 1)

  // Recalculate scene offsets and global indices
  let offset = 0
  for (const ch of project.chapters) {
    ch.sceneOffset = offset
    ch.scenes.forEach((s, i) => {
      s.globalIndex = offset + i + 1
    })
    offset += ch.scenes.length
  }

  saveProject(project)
  return project
}

// ─────────────────────────────────────────────
// Scene management within chapters
// ─────────────────────────────────────────────
export function updateScene(projectId, chapterId, sceneIndex, updates) {
  const project = loadProject(projectId)
  if (!project) throw new Error('Project not found')

  const chapter = project.chapters.find(c => c.id === chapterId)
  if (!chapter) throw new Error('Chapter not found')

  const scene = chapter.scenes[sceneIndex]
  if (!scene) throw new Error('Scene not found')

  // Apply updates
  if (updates.content !== undefined) scene.content = updates.content
  if (updates.code !== undefined) scene.code = updates.code
  if (updates.videoUrl !== undefined) {
    scene.videoUrl = updates.videoUrl
    scene.renderedAt = new Date().toISOString()
    scene.status = 'rendered'
  }
  if (updates.imageUrl !== undefined) {
    scene.imageUrl = updates.imageUrl
    scene.renderedAt = new Date().toISOString()
    scene.status = 'rendered'
  }
  if (updates.status !== undefined) scene.status = updates.status
  if (updates.flag !== undefined) scene.flag = updates.flag
  if (updates.notes !== undefined) scene.notes = updates.notes
  if (updates.prompt !== undefined) scene.prompt = updates.prompt
  if (updates.environment !== undefined) scene.environment = updates.environment
  if (updates.camera !== undefined) scene.camera = updates.camera
  if (updates.error !== undefined) scene.error = updates.error
  if (updates.template !== undefined) scene.template = updates.template
  if (updates.lower_third !== undefined) scene.lower_third = updates.lower_third
  if (updates.duration !== undefined) scene.duration = updates.duration
  if (updates.editInstruction) {
    if (!scene.editHistory) scene.editHistory = []
    scene.editHistory.push(updates.editInstruction)
  }

  chapter.updatedAt = new Date().toISOString()
  saveProject(project)
  return { project, chapter, scene }
}

export function flagScene(projectId, chapterId, sceneIndex, flag) {
  return updateScene(projectId, chapterId, sceneIndex, { flag })
}

// ─────────────────────────────────────────────
// Project stats
// ─────────────────────────────────────────────
export function getProjectStats(projectId) {
  const project = loadProject(projectId)
  if (!project) throw new Error('Project not found')

  const allScenes = project.chapters.flatMap(ch => ch.scenes)
  return {
    totalChapters: project.chapters.length,
    lockedChapters: project.chapters.filter(c => c.status === 'locked').length,
    totalScenes: allScenes.length,
    renderedScenes: allScenes.filter(s => s.status === 'rendered' || s.status === 'locked').length,
    flaggedScenes: allScenes.filter(s => s.flag === 'needs-fix').length,
    templateScenes: allScenes.filter(s => s.type === 'TEMPLATE').length,
    renderScenes: allScenes.filter(s => s.type === '3D_RENDER').length,
    chapters: project.chapters.map(ch => ({
      id: ch.id,
      title: ch.title,
      status: ch.status,
      sceneCount: ch.scenes.length,
      renderedCount: ch.scenes.filter(s => s.status === 'rendered' || s.status === 'locked').length,
      flaggedCount: ch.scenes.filter(s => s.flag === 'needs-fix').length,
      sceneRange: ch.scenes.length > 0
        ? `${ch.scenes[0].globalIndex}-${ch.scenes[ch.scenes.length - 1].globalIndex}`
        : '—',
    })),
  }
}
