import sys
import re

with open('server/autoScene.js', 'r', encoding='utf-8') as f:
    content = f.read()

# First replace the large generateScenes prompt block
# Look for "const model = googleAI.getGenerativeModel({" around line 746

pattern1 = re.compile(
    r'(// 3D Render Prompt Generation — THREE-STEP CINEMATOGRAPHY METHOD\s*console\.log\(`   🖼️ Scene \$\{scene\.index\}: Generating cinematic 3D prompt\.\.\.`\)\s*)const model = googleAI\.getGenerativeModel\(\{\s*model: getGEMINI_MODEL\(\),\s*systemInstruction: `You are the ARXXIS cinematographer.*?Output only the prompt text\. No explanation\. No preamble\.`\s*\}\)',
    re.DOTALL
)

replacement1 = r'''\1
      let styleRules = `• 60–80 words maximum
• Dark, moody, cinematic color grading
• Deep shadows with single dramatic light source
• Hyperrealistic surface textures (brushed metal, worn leather, glass, concrete, aged wood)
• No humans, no faces, no hands, no body parts
• No text, no labels, no UI elements on screens (blur or obscure them)
• Shallow depth of field — hero object sharp, background soft
• 16:9 cinematic framing`;
      
      let initialInstruction = "You NEVER describe people — only environments, objects, and atmosphere.";

      if (scene.theme === 'VORTEXIS') {
        initialInstruction = "You NEVER describe people with details, but you ALLOW and ENCOURAGE completely featureless silhouettes.";
        styleRules = `• 60–80 words maximum
• High contrast cinematic silhouette style
• Featureless silhouettes of people are ALLOWED and ENCOURAGED, but they MUST be strictly featureless silhouettes.
• Colors must be predominantly blue, black, and red.
• Lighting must be light on the inside and dark on the edges (heavy vignette).
• Deep shadows with single dramatic light source
• No text, no labels, no UI elements on screens (blur or obscure them)
• Shallow depth of field — hero object sharp, background soft
• 16:9 cinematic framing`;
      }

      const model = googleAI.getGenerativeModel({
        model: getGEMINI_MODEL(),
        systemInstruction: `You are the ARXXIS cinematographer. You write image generation prompts for photorealistic 3D documentary scenes. ${initialInstruction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULE — SPECIFICITY OVER GENERICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your prompt MUST be SPECIFIC to THIS scene and THIS story.
• Extract the exact location, objects, or technology named in the scene sentence.
• If the scene mentions a specific company, country, device, or event — use it.
• NEVER produce a generic "dark moody room" prompt that could belong to any scene.
• If the story is about a cyberattack → show servers, terminals, network cables.
• If the story is about a financial fraud → show trading screens, documents, money.
• If the story is about espionage → show listening devices, surveillance equipment.
• The viewer should be able to guess what the story is just from seeing your image.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THREE-STEP METHOD (follow in order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — SET THE ATMOSPHERE
One emotional quality that fits THIS specific scene:
tension, isolation, dread, secrecy, discovery, betrayal, urgency, quiet menace, hollow bureaucracy, digital coldness

STEP 2 — CHOOSE THE SYMBOLIC OBJECT / SUBJECT
Find the ONE object or silhouette from THIS scene that carries the meaning.
Use the STORY CONTEXT and KEY ENTITIES to make it specific.

STEP 3 — DESCRIBE THE ENVIRONMENT
Room type, lighting quality, depth of field, color temperature, surface materials, time of day.
Match the environment to the story's world (government building, data center, suburban home, law firm, etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${styleRules}

Output only the prompt text. No explanation. No preamble.`
      })'''

content = pattern1.sub(replacement1, content)

# Second, replace regenerateImagePrompt

pattern2 = re.compile(
    r'(export async function regenerateImagePrompt\(sceneScript, chapterScriptText\)) \{([^\}]+)const model = googleAI\.getGenerativeModel\(\{.*?STYLE:.*?Output only the prompt text\.`,?\s*\}\)(.*?)return result\.response\.text\(\)\.trim\(\)\s*\}',
    re.DOTALL
)

replacement2 = r'''export async function regenerateImagePrompt(sceneScript, chapterScriptText, theme = null) {
  const storyContext = buildStoryContext(chapterScriptText || sceneScript)

  let styleRules = `60–80 words, dark cinematic, no humans/faces/hands, no readable text on screens, shallow DOF, 16:9.`;
  let initialInstruction = "You NEVER describe people — only environments, objects, and atmosphere.";

  if (theme === 'VORTEXIS') {
    initialInstruction = "You NEVER describe people with details, but you ALLOW and ENCOURAGE completely featureless silhouettes.";
    styleRules = `60–80 words, high contrast cinematic silhouette style, featureless silhouettes of people ALLOWED, blue/black/red colors, light inside and dark edges (vignette), no readable text on screens, shallow DOF, 16:9.`;
  }

  const model = googleAI.getGenerativeModel({
    model: getGEMINI_MODEL(),
    systemInstruction: `You are the ARXXIS cinematographer. You write image generation prompts for photorealistic 3D documentary scenes. ${initialInstruction}

CRITICAL RULE — SPECIFICITY OVER GENERICS
Your prompt MUST be SPECIFIC to THIS scene and THIS story.
• Extract the exact location, objects, or technology named in the scene sentence.
• If the scene mentions a specific company, country, device, or event — use it.
• NEVER produce a generic "dark moody room" prompt that could belong to any scene.
• The viewer should be able to guess what the story is just from seeing your image.

THREE-STEP METHOD:
1. ATMOSPHERE — one emotional quality (tension, dread, secrecy, discovery, urgency...)
2. SYMBOLIC OBJECT / SUBJECT — the ONE object/silhouette from the scene that carries the meaning. Use story context to make it specific.
3. ENVIRONMENT — room type, lighting, depth of field, color temperature, surface materials.

STYLE: ${styleRules}
Output only the prompt text.`,
  })

  const result = await callGemini(model, `${storyContext}\n\nSCENE TO VISUALIZE: "${sceneScript}"`)
  return result.response.text().trim()
}'''

content = pattern2.sub(replacement2, content)

with open('server/autoScene.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated autoScene.js")
