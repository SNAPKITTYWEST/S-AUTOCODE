# S-AUTOCODE Design Guide

> **Visual identity, logos, and screenshot specifications**

---

## Brand Colors

### Primary Palette

```css
--accent-primary: #5e6ad2;    /* Main brand color */
--accent-hover: #7c87e8;      /* Hover state */
--accent-active: #4a54b3;     /* Active state */
--accent-glow: rgba(94,106,210,0.2); /* Glow effect */
```

### Agent Colors

```css
--agent-forge: #5e6ad2;       /* FORGE - Compiler */
--agent-sentinel: #34c759;    /* SENTINEL - Security */
--agent-oracle: #f5a623;      /* ORACLE - Analyzer */
--agent-codex: #4a90e2;       /* CODEX - AI Coder */
--agent-vault: #bd10e0;       /* VAULT - Storage */
```

### Status Colors

```css
--status-success: #34c759;    /* Success/Complete */
--status-warning: #ff9500;    /* Warning/In Progress */
--status-error: #ff3b30;      /* Error/Failed */
--status-info: #007aff;       /* Info */
```

### Background Colors

```css
--bg-primary: #0a0a0a;        /* Main background */
--bg-secondary: #141414;      /* Panels */
--bg-tertiary: #1c1c1c;       /* Headers */
--bg-elevated: #242424;       /* Modals */
```

---

## Logo Usage

### Primary Logo (`docs/logo.svg`)

**Specifications:**
- Size: 200x200px
- Format: SVG (scalable)
- Background: Dark (#0a0a0a)
- Symbol: ⦹ (Circled Bullet Operator)
- Color: Accent Primary (#5e6ad2)

**Usage:**
- GitHub repository icon
- Favicon (convert to ICO/PNG)
- Social media profile
- Documentation headers

**Minimum Size:** 32x32px  
**Clear Space:** 10px on all sides

### Banner (`docs/banner.svg`)

**Specifications:**
- Size: 1200x400px
- Format: SVG
- Background: Dark with grid pattern
- Animated agent dots
- Feature pills

**Usage:**
- README.md header
- GitHub social preview
- Website hero section
- Marketing materials

---

## Typography

### Font Stack

```css
--font-sans: 'SF Pro Display', 'SF Pro Text', -apple-system, 
             BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', 
             'Cascadia Code', monospace;
```

### Font Sizes

```css
--font-size-xs: 11px;
--font-size-sm: 12px;
--font-size-base: 13px;
--font-size-lg: 14px;
--font-size-xl: 15px;
--font-size-2xl: 17px;
--font-size-3xl: 20px;
```

### Font Weights

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

---

## Screenshot Guidelines

### Dimensions

**Desktop (Primary):**
- Width: 1920px
- Height: 1080px
- Aspect Ratio: 16:9

**Thumbnail:**
- Width: 800px
- Height: 450px
- Aspect Ratio: 16:9

**Social Media:**
- Twitter: 1200x675px
- LinkedIn: 1200x627px
- Facebook: 1200x630px

### Quality Settings

**PNG:**
- Color Depth: 24-bit
- Compression: Medium (TinyPNG)
- Max File Size: 500KB

**GIF:**
- Frame Rate: 15-30 fps
- Colors: 256
- Loop: Infinite
- Max File Size: 5MB

### Capture Settings

**Browser:**
- Chrome/Edge (best rendering)
- Zoom: 100%
- Window: Maximized
- DevTools: Closed

**Theme:**
- Dark mode enabled
- High contrast: Off
- Animations: On

---

## Screenshot Composition

### 1. Observatory View

**Elements to Show:**
- ✅ Command bar with logo
- ✅ 5-pane layout
- ✅ Project explorer (left)
- ✅ Terminal with output (center)
- ✅ Agent chat (right)
- ✅ Bottom panels (memory, proofs, widgets)

**Highlight:**
- Active agent (CODEX)
- Terminal with factorial result
- WORM indicator showing blocks

### 2. CODEX Agent Chat

**Elements to Show:**
- ✅ Agent heap with all 5 agents
- ✅ Selected agent profile
- ✅ Conversation history
- ✅ Reasoning ticker (active)
- ✅ Input field with placeholder

**Highlight:**
- Reasoning steps with formulas
- Agent trust level (HIGH)
- WORM entries count

### 3. Monaco Editor

**Elements to Show:**
- ✅ Editor with syntax highlighting
- ✅ Line numbers
- ✅ File tabs
- ✅ Status bar
- ✅ Code being typed (mid-animation)

**Highlight:**
- Syntax colors
- Cursor position
- File name (fibonacci.py)

### 4. Terminal Commands

**Elements to Show:**
- ✅ Multiple commands executed
- ✅ Different output types (result, error, info)
- ✅ Prompt symbol (➜)
- ✅ Scrollable history

**Highlight:**
- Color-coded outputs
- Command variety
- Clean formatting

---

## GIF Animation Guidelines

### Fibonacci Generation

**Duration:** 8-10 seconds  
**Frames:** 240-300 (30fps)

**Sequence:**
1. User types in chat (1s)
2. CODEX responds (1s)
3. Editor opens empty (0.5s)
4. Code types character-by-character (5s)
5. Final code with syntax highlighting (1.5s)

**Optimization:**
- Reduce colors to 128
- Dither: None
- Lossy: 30

### Reasoning Ticker

**Duration:** 3-4 seconds  
**Frames:** 90-120 (30fps)

**Sequence:**
1. All steps pending (○) (0.5s)
2. First step computing (◎) (0.5s)
3. First step complete (✓) (0.3s)
4. Repeat for each step (2s)
5. All complete (0.5s)

**Optimization:**
- Reduce colors to 64
- Dither: None
- Lossy: 40

---

## Icon Set

### Agent Icons

Create 28x28px icons for each agent:

**FORGE (Compiler):**
```
Symbol: ⚙️ or ⦿
Color: #5e6ad2
```

**SENTINEL (Security):**
```
Symbol: 🛡️ or ◈
Color: #34c759
```

**ORACLE (Analyzer):**
```
Symbol: 🔍 or ◉
Color: #f5a623
```

**CODEX (AI Coder):**
```
Symbol: 🤖 or ◎
Color: #4a90e2
```

**VAULT (Storage):**
```
Symbol: 🔐 or ◆
Color: #bd10e0
```

---

## Social Media Assets

### Twitter Card

**Size:** 1200x675px  
**Content:**
- Logo (top-left)
- Title: "S-AUTOCODE"
- Subtitle: "AI Coding Environment"
- Screenshot: Observatory view
- CTA: "Try Live Demo →"

### LinkedIn Post

**Size:** 1200x627px  
**Content:**
- Banner background
- Logo (centered)
- Title + Subtitle
- 3 feature highlights
- Link to demo

### Product Hunt

**Size:** 240x240px  
**Content:**
- Logo only
- Clean background
- High contrast

---

## Favicon

### Sizes Needed

```
favicon.ico (multi-size):
- 16x16px
- 32x32px
- 48x48px

apple-touch-icon.png:
- 180x180px

favicon-32x32.png
favicon-16x16.png
```

### Generation

1. Start with `docs/logo.svg`
2. Export at each size
3. Use realfavicongenerator.net
4. Place in root directory

---

## Marketing Materials

### Demo Video Thumbnail

**Size:** 1280x720px  
**Content:**
- Screenshot of typing animation
- Play button overlay
- Title: "Watch CODEX in Action"
- Duration badge: "2:30"

### GitHub Social Preview

**Size:** 1280x640px  
**Content:**
- Banner as background
- Large logo
- Tagline: "Like IBM's Bob, but in your browser"
- Feature pills

---

## File Naming Convention

```
# Logos
logo.svg
logo-light.svg (if needed)
logo-dark.svg (if needed)
logo-icon.svg (symbol only)

# Screenshots
observatory-view.png
agent-chat.png
monaco-editor.png
terminal-commands.png
worm-chain.png

# Animations
fibonacci-generation.gif
reasoning-ticker.gif
typing-animation.gif

# Social
twitter-card.png
linkedin-post.png
product-hunt-icon.png
```

---

## Tools & Resources

### Design Tools
- **Figma** - UI mockups
- **Inkscape** - SVG editing
- **GIMP** - Image editing
- **Photopea** - Online Photoshop alternative

### Screenshot Tools
- **ShareX** (Windows) - Best for automation
- **Flameshot** (Linux) - Feature-rich
- **Cmd+Shift+4** (Mac) - Built-in

### GIF Tools
- **ScreenToGif** - Best quality
- **ezgif.com** - Online optimization
- **gifski** - CLI tool for high quality

### Optimization
- **TinyPNG** - PNG compression
- **SVGOMG** - SVG optimization
- **ImageOptim** - Batch processing

---

## Quick Start Checklist

- [ ] Download logo.svg and banner.svg
- [ ] Generate favicon set
- [ ] Capture 14 screenshots (see SCREENSHOTS.md)
- [ ] Create 3 GIF animations
- [ ] Optimize all images
- [ ] Update README.md with real images
- [ ] Create social media cards
- [ ] Generate demo video thumbnail

---

## Need Custom Assets?

Contact the design team or use these tools:

- **Canva** - Quick social media graphics
- **Figma Community** - Free templates
- **Unsplash** - Stock photos (if needed)
- **Flaticon** - Icon sets

---

**Design System Version:** 1.0.0  
**Last Updated:** 2026-07-09  
**Maintained by:** S-AUTOCODE Team