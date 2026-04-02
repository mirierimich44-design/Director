// ── EXPORT ────────────────────────────────────────────────────────────────────
// Export a project or chapter as a ZIP file with all assets
app.get('/api/projects/:pid/export', async (req, res) => {
    try {
        const { pid } = req.params;
        const project = getProject(pid);
        if (!project) return res.status(404).send('Project not found');

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.attachment(`${project.name.replace(/[^a-z0-9]/gi, '_')}.zip`);
        archive.pipe(res);

        for (const chapter of project.chapters) {
            for (const scene of chapter.scenes) {
                if (scene.videoUrl) {
                    const videoPath = join(publicDir, scene.videoUrl);
                    if (fsSync.existsSync(videoPath)) {
                        archive.file(videoPath, { name: `chapter_${chapter.id.substring(0,4)}/scene_${scene.globalIndex}_video.mp4` });
                    }
                }
                if (scene.imageUrl) {
                    const imagePath = join(publicDir, scene.imageUrl);
                    if (fsSync.existsSync(imagePath)) {
                        archive.file(imagePath, { name: `chapter_${chapter.id.substring(0,4)}/scene_${scene.globalIndex}_image.jpg` });
                    }
                }
            }
        }
        archive.finalize();
    } catch (err) {
        res.status(500).send('Failed to export project');
    }
});

app.get('/api/projects/:pid/chapters/:cid/export', async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const project = getProject(pid);
        const chapter = project ? project.chapters.find(c => c.id === cid) : null;
        if (!chapter) return res.status(404).send('Chapter not found');

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.attachment(`chapter_${chapter.title.replace(/[^a-z0-9]/gi, '_')}.zip`);
        archive.pipe(res);

        for (const scene of chapter.scenes) {
            if (scene.videoUrl) {
                const videoPath = join(publicDir, scene.videoUrl);
                if (fsSync.existsSync(videoPath)) {
                    archive.file(videoPath, { name: `scene_${scene.globalIndex}_video.mp4` });
                }
            }
            if (scene.imageUrl) {
                const imagePath = join(publicDir, scene.imageUrl);
                if (fsSync.existsSync(imagePath)) {
                    archive.file(imagePath, { name: `scene_${scene.globalIndex}_image.jpg` });
                }
            }
        }
        archive.finalize();
    } catch (err) {
        res.status(500).send('Failed to export chapter');
    }
});
