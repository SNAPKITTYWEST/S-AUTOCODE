# Screenshot Guide for S-AUTOCODE

> **Instructions for capturing screenshots to complete the documentation**

---

## Required Screenshots

### 1. Observatory View (`observatory-view.png`)
**Location:** Main landing page  
**What to capture:** Full 5-pane layout
- Left: Project Explorer with AST
- Center: Terminal + Agent Forge
- Right: Agent Chat with CODEX
- Bottom: Memory Tape, Proofs, Widgets

**Steps:**
1. Open https://snapkittywest.github.io/S-AUTOCODE/
2. Wait for full load
3. Capture full window (1920x1080 recommended)
4. Save as `docs/screenshots/observatory-view.png`

---

### 2. First Command (`first-command.png`)
**What to capture:** Terminal showing factorial command

**Steps:**
1. Type in terminal: `factorial 5`
2. Press Enter
3. Capture terminal output showing `5! = 120`
4. Save as `docs/screenshots/first-command.png`

---

### 3. Fibonacci Generation (`fibonacci-generation.gif`)
**What to capture:** Animated GIF of code typing

**Steps:**
1. Open agent chat (right panel)
2. Select CODEX agent
3. Type: `open editor fibonacci.py and write fibonacci code`
4. Start screen recording
5. Watch code type into Monaco editor
6. Stop recording after code completes
7. Convert to GIF (use tool like ScreenToGif)
8. Save as `docs/screenshots/fibonacci-generation.gif`

---

### 4. Git Status (`git-status.png`)
**What to capture:** CODEX executing git command

**Steps:**
1. In agent chat, type: `run git status`
2. Wait for response
3. Capture chat showing command output
4. Save as `docs/screenshots/git-status.png`

---

### 5. Search Results (`search-results.png`)
**What to capture:** Code search results

**Steps:**
1. Type: `search for 'fireworks' in all files`
2. Capture results showing file matches
3. Save as `docs/screenshots/search-results.png`

---

### 6. Navigate Sandbox (`navigate-sandbox.png`)
**What to capture:** Sandbox view after navigation

**Steps:**
1. Type: `go to sandbox`
2. Wait for route change
3. Capture sandbox panels (registers, memory, trace)
4. Save as `docs/screenshots/navigate-sandbox.png`

---

### 7. Read File (`read-file.png`)
**What to capture:** File contents display

**Steps:**
1. Type: `read script.js`
2. Capture output with syntax highlighting
3. Save as `docs/screenshots/read-file.png`

---

### 8. List Files (`list-files.png`)
**What to capture:** Directory listing

**Steps:**
1. Type: `list files in this directory`
2. Capture bullet list of files
3. Save as `docs/screenshots/list-files.png`

---

### 9. Terminal Commands (`terminal-commands.png`)
**What to capture:** Multiple terminal commands

**Steps:**
1. Execute: `factorial 5`
2. Execute: `sum 10 20 30`
3. Execute: `help`
4. Capture all outputs
5. Save as `docs/screenshots/terminal-commands.png`

---

### 10. Monaco Editor (`monaco-editor.gif`)
**What to capture:** Editor with typing animation

**Steps:**
1. Record CODEX opening editor and typing code
2. Show syntax highlighting
3. Show cursor movement
4. Convert to GIF
5. Save as `docs/screenshots/monaco-editor.gif`

---

### 11. Agent Chat (`agent-chat.png`)
**What to capture:** Full agent chat interface

**Steps:**
1. Show agent heap with all 5 agents
2. Show selected agent (CODEX)
3. Show conversation history
4. Show reasoning ticker
5. Save as `docs/screenshots/agent-chat.png`

---

### 12. Reasoning Ticker (`reasoning-ticker.gif`)
**What to capture:** Animated reasoning steps

**Steps:**
1. Ask CODEX a question
2. Record reasoning ticker animation
3. Show steps: pending → computing → complete
4. Convert to GIF
5. Save as `docs/screenshots/reasoning-ticker.gif`

---

### 13. WORM Chain (`worm-chain.png`)
**What to capture:** Blockchain explorer

**Steps:**
1. Navigate to WORM view (click WORM in menu)
2. Show multiple blocks
3. Show block details
4. Save as `docs/screenshots/worm-chain.png`

---

### 14. Command Palette (`command-palette.png`)
**What to capture:** Command palette modal

**Steps:**
1. Press `Ctrl+K`
2. Type a search query
3. Show results
4. Save as `docs/screenshots/command-palette.png`

---

## Screenshot Specifications

### Image Format
- **Static images:** PNG (lossless)
- **Animations:** GIF (optimized, < 5MB)
- **High-res:** 1920x1080 or higher
- **Compression:** Use TinyPNG or similar

### Naming Convention
```
kebab-case-description.png
kebab-case-animation.gif
```

### File Size Limits
- PNG: < 500KB (compress if larger)
- GIF: < 5MB (optimize frame rate)

---

## Tools Recommended

### Screen Capture
- **Windows:** Snipping Tool, ShareX
- **Mac:** Cmd+Shift+4
- **Linux:** Flameshot, GNOME Screenshot

### GIF Recording
- **ScreenToGif** (Windows) - Best quality
- **LICEcap** (Cross-platform) - Simple
- **Kap** (Mac) - Beautiful output

### Image Optimization
- **TinyPNG** - Online compression
- **ImageOptim** (Mac) - Batch processing
- **GIMP** - Manual editing

---

## Quality Checklist

Before saving each screenshot:

- [ ] Full resolution (1920x1080+)
- [ ] No personal information visible
- [ ] Clear, readable text
- [ ] Proper lighting/contrast
- [ ] No browser UI (unless relevant)
- [ ] Cropped appropriately
- [ ] Compressed for web
- [ ] Named correctly

---

## Placeholder Images

Until real screenshots are captured, placeholders are used:

```markdown
![Description](https://via.placeholder.com/1200x600/0a0a0a/5e6ad2?text=Description)
```

**Replace these with real screenshots ASAP!**

---

## After Capturing

1. **Save to:** `S-AUTOCODE/docs/screenshots/`
2. **Update README.md:** Replace placeholder URLs
3. **Update USAGE_GUIDE.md:** Replace placeholder URLs
4. **Commit:** `git add docs/screenshots && git commit -m "Add screenshots"`
5. **Push:** `git push origin master`

---

## Example Workflow

```bash
# 1. Capture screenshots
# (Use tools above)

# 2. Optimize images
cd S-AUTOCODE/docs/screenshots
# Use TinyPNG or ImageOptim

# 3. Update documentation
# Replace placeholder URLs in README.md and USAGE_GUIDE.md

# 4. Commit and push
git add .
git commit -m "Add production screenshots and GIFs"
git push origin master

# 5. Verify on GitHub Pages
# Visit https://snapkittywest.github.io/S-AUTOCODE/
```

---

## Need Help?

- **Image editing:** Use GIMP or Photoshop
- **GIF optimization:** Use ezgif.com
- **Questions:** Open an issue on GitHub

---

**Priority:** HIGH - Screenshots are essential for user adoption!