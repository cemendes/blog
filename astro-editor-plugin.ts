import type { AstroIntegration } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export function astroLiveEditor(): AstroIntegration {
	return {
		name: 'astro-live-editor',
		hooks: {
			'astro:server:setup': ({ server }) => {
				// API Endpoint to save post
				server.middlewares.use(async (req, res, next) => {
					if (req.url === '/api/save-post' && req.method === 'POST') {
						let body = '';
						req.on('data', (chunk) => { body += chunk; });
						req.on('end', async () => {
							try {
								const { slug, rawContent } = JSON.parse(body);
								if (!slug || typeof rawContent !== 'string') {
									res.statusCode = 400;
									res.setHeader('Content-Type', 'application/json');
									res.end(JSON.stringify({ error: 'Invalid payload' }));
									return;
								}
								const safeSlug = path.basename(slug.replace(/\.md$/, ''));
								const blogDir = path.resolve(process.cwd(), 'src/content/blog');
								const targetFile = path.join(blogDir, `${safeSlug}.md`);
								await fs.writeFile(targetFile, rawContent, 'utf-8');

								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.end(JSON.stringify({ success: true, file: targetFile }));
							} catch (e: any) {
								res.statusCode = 500;
								res.setHeader('Content-Type', 'application/json');
								res.end(JSON.stringify({ error: e.message }));
							}
						});
						return;
					}

					// Route to serve interactive editor at /edit/:slug
					const match = req.url?.match(/^\/edit\/([^/?#]+)/);
					if (match && req.method === 'GET') {
						const rawSlug = match[1];
						const safeSlug = path.basename(rawSlug.replace(/\.md$/, ''));
						const blogDir = path.resolve(process.cwd(), 'src/content/blog');
						const targetFile = path.join(blogDir, `${safeSlug}.md`);

						let fileContent = '';
						try {
							fileContent = await fs.readFile(targetFile, 'utf-8');
						} catch (err) {
							res.statusCode = 404;
							res.end(`Post file not found: ${targetFile}`);
							return;
						}

						const isDraft = /draft:\s*true/i.test(fileContent);

						const html = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Live Editor: ${safeSlug}</title>
	<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
	<style>
		* { box-sizing: border-box; }
		body {
			margin: 0; padding: 0;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
			background: #f8fafc; color: #1e293b;
			display: flex; flex-direction: column; height: 100vh; overflow: hidden;
		}
		header.editor-bar {
			background: #0f172a; color: #ffffff;
			padding: 0.75rem 1.25rem;
			display: flex; align-items: center; justify-content: space-between;
			border-bottom: 1px solid #334155; z-index: 50;
		}
		.editor-brand { display: flex; align-items: center; gap: 0.75rem; }
		.editor-brand a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; font-weight: 500; }
		.editor-brand a:hover { color: #f8fafc; }
		.slug-badge {
			background: #1e293b; padding: 3px 10px; border-radius: 6px;
			font-family: monospace; font-size: 0.85rem; color: #38bdf8;
		}
		.controls-group { display: flex; align-items: center; gap: 0.75rem; }
		.mode-toggle {
			display: flex; background: #1e293b; border-radius: 8px;
			padding: 3px; border: 1px solid #334155;
		}
		.mode-btn {
			background: transparent; border: none; color: #94a3b8;
			padding: 5px 12px; font-size: 0.85rem; font-weight: 600;
			border-radius: 6px; cursor: pointer; transition: all 0.15s ease;
		}
		.mode-btn.active {
			background: #38bdf8; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
		}
		.draft-pill {
			display: flex; align-items: center; gap: 0.5rem;
			background: #1e293b; border: 1px solid #334155;
			padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
		}
		.status-text.draft { color: #fbbf24; font-weight: 700; }
		.status-text.published { color: #34d399; font-weight: 700; }
		.save-btn {
			background: #2563eb; color: white; border: none;
			padding: 6px 16px; border-radius: 6px; font-weight: 700;
			font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
		}
		.save-btn:hover { background: #1d4ed8; }
		.save-btn.saving { opacity: 0.7; pointer-events: none; }
		#save-toast { font-size: 0.82rem; color: #94a3b8; margin-right: 0.5rem; }

		.workspace {
			flex: 1; display: flex; height: calc(100vh - 58px); overflow: hidden; position: relative;
		}
		.pane-left {
			flex: 1; display: flex; flex-direction: column; border-right: 1px solid #e2e8f0; background: #ffffff; height: 100%;
		}
		.pane-header {
			padding: 6px 14px; background: #f1f5f9; font-size: 0.75rem; font-weight: 700;
			text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;
			border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;
		}
		#raw-editor {
			flex: 1; width: 100%; height: 100%; border: none; padding: 1.25rem;
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
			font-size: 15px; line-height: 1.6; color: #0f172a; resize: none; outline: none; background: #ffffff; tab-size: 2;
		}
		.pane-right {
			flex: 1; background: #ffffff; overflow-y: auto; height: 100%; padding: 2.5em 2em;
		}
		.blog-preview-container {
			width: 840px; max-width: 100%; margin: 0 auto;
		}
		.workspace.mode-visual .pane-left { display: none; }
		.workspace.mode-visual .pane-right {
			flex: 1; width: 100%; max-width: 900px; margin: 0 auto;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;
		}
		.preview-content { color: #1e293b; font-size: 18px; line-height: 1.75; outline: none; }
		.preview-content h1, .preview-content h2, .preview-content h3, .preview-content h4 {
			color: #0f172a; font-weight: 800; margin-top: 1.5em; margin-bottom: 0.5em;
		}
		.preview-content h1 { font-size: 2.25rem; }
		.preview-content h2 { font-size: 1.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
		.preview-content h3 { font-size: 1.35rem; }
		.preview-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9em; }
		.preview-content th, .preview-content td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; }
		.preview-content th { background: #f8fafc; font-weight: 700; color: #0f172a; }
		.preview-content code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; font-family: ui-monospace, SFMono-Regular, monospace; }
		.preview-content pre { background: #0f172a; color: #f8fafc; padding: 1.25em 1.5em; border-radius: 8px; overflow-x: auto; }
		.preview-content pre code { background: transparent; padding: 0; color: inherit; }
		.preview-content blockquote { border-left: 4px solid #2337ff; background: #f8fafc; padding: 0.75rem 1.25rem; margin: 1.25rem 0; border-radius: 0 8px 8px 0; }
	</style>
</head>
<body>
	<header class="editor-bar">
		<div class="editor-brand">
			<a href="/blog/${safeSlug}/">← View Post</a>
			<span class="slug-badge">${safeSlug}.md</span>
		</div>

		<div class="controls-group">
			<div class="mode-toggle">
				<button id="btn-split" class="mode-btn active" onclick="setMode('split')">Split View</button>
				<button id="btn-visual" class="mode-btn" onclick="setMode('visual')">Visual In-Place</button>
			</div>

			<label class="draft-pill" title="Toggle draft status for Cloudflare Pages">
				<input type="checkbox" id="draft-toggle" ${isDraft ? 'checked' : ''} onchange="toggleDraftStatus()" />
				<span id="draft-status-label" class="status-text ${isDraft ? 'draft' : 'published'}">
					${isDraft ? 'Draft (Private)' : 'Published'}
				</span>
			</label>

			<span id="save-toast"></span>
			<button id="save-btn" class="save-btn" onclick="saveDocument()">
				💾 Save Changes <span style="font-size: 0.75rem; opacity: 0.8;">(Cmd+S)</span>
			</button>
		</div>
	</header>

	<main id="workspace-container" class="workspace mode-split">
		<div class="pane-left">
			<div class="pane-header">
				<span>Raw Markdown Editor</span>
				<span>Auto-syncing to Preview</span>
			</div>
			<textarea id="raw-editor" spellcheck="false">${fileContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
		</div>

		<div class="pane-right">
			<div class="blog-preview-container">
				<div id="visual-canvas" class="preview-content" contenteditable="false"></div>
			</div>
		</div>
	</main>

	<script>
		const initialSlug = "${safeSlug}";
		let currentMode = 'split';
		const rawEditor = document.getElementById('raw-editor');
		const visualCanvas = document.getElementById('visual-canvas');
		const workspace = document.getElementById('workspace-container');
		const saveBtn = document.getElementById('save-btn');
		const saveToast = document.getElementById('save-toast');
		const draftToggle = document.getElementById('draft-toggle');
		const draftStatusLabel = document.getElementById('draft-status-label');

		function extractParts(text) {
			const match = text.match(/^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/);
			if (match) {
				return { frontmatter: match[1], body: match[2] };
			}
			return { frontmatter: '', body: text };
		}

		function updatePreview() {
			const { body } = extractParts(rawEditor.value);
			if (window.marked && window.DOMPurify) {
				visualCanvas.innerHTML = DOMPurify.sanitize(marked.parse(body));
			}
		}

		function setMode(mode) {
			currentMode = mode;
			document.getElementById('btn-split').classList.toggle('active', mode === 'split');
			document.getElementById('btn-visual').classList.toggle('active', mode === 'visual');
			workspace.className = 'workspace mode-' + mode;

			if (mode === 'visual') {
				updatePreview();
				visualCanvas.setAttribute('contenteditable', 'true');
			} else {
				visualCanvas.setAttribute('contenteditable', 'false');
			}
		}

		function toggleDraftStatus() {
			const isNowDraft = draftToggle.checked;
			draftStatusLabel.textContent = isNowDraft ? 'Draft (Private)' : 'Published';
			draftStatusLabel.className = 'status-text ' + (isNowDraft ? 'draft' : 'published');

			let text = rawEditor.value;
			const match = text.match(/^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/);
			if (match) {
				let frontmatter = match[1];
				const body = match[2];
				if (/draft:\\s*(true|false)/i.test(frontmatter)) {
					frontmatter = frontmatter.replace(/draft:\\s*(true|false)/i, 'draft: ' + isNowDraft);
				} else {
					frontmatter += '\\ndraft: ' + isNowDraft;
				}
				rawEditor.value = '---\\n' + frontmatter.trim() + '\\n---\\n' + body;
			}
		}

		async function saveDocument() {
			saveBtn.classList.add('saving');
			saveBtn.textContent = 'Saving...';
			saveToast.textContent = '';

			const payload = {
				slug: initialSlug,
				rawContent: rawEditor.value,
			};

			try {
				const res = await fetch('/api/save-post', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				const data = await res.json();
				if (res.ok && data.success) {
					saveToast.textContent = '✓ Saved to disk';
					saveToast.style.color = '#34d399';
					setTimeout(() => { saveToast.textContent = ''; }, 3000);
				} else {
					alert('Error saving: ' + (data.error || 'Unknown error'));
				}
			} catch (err) {
				alert('Save failed: ' + err.message);
			} finally {
				saveBtn.classList.remove('saving');
				saveBtn.innerHTML = '💾 Save Changes <span style="font-size: 0.75rem; opacity: 0.8;">(Cmd+S)</span>';
			}
		}

		rawEditor.addEventListener('input', () => {
			if (currentMode === 'split') {
				updatePreview();
			}
		});

		document.addEventListener('keydown', (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 's') {
				e.preventDefault();
				saveDocument();
			}
		});

		updatePreview();
	</script>
</body>
</html>`;

						res.statusCode = 200;
						res.setHeader('Content-Type', 'text/html');
						res.end(html);
						return;
					}

					next();
				});
			},
		},
	};
}
