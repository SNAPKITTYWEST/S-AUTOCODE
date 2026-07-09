# S-AUTOCODE Testing Checklist

Complete manual testing guide for S-AUTOCODE before production deployment.

## Pre-Testing Setup

### 1. Build WASM Module
```bash
cd src/wasm
wasm-pack build --target web --out-dir ../../pkg
```

**Expected Output:**
- ✅ `pkg/` directory created
- ✅ `pkg/s_autocode_wasm.js` exists
- ✅ `pkg/s_autocode_wasm_bg.wasm` exists
- ✅ No build errors

**Troubleshooting:**
- If build fails, check Rust installation: `rustc --version`
- Install wasm-pack: `cargo install wasm-pack`
- Check Cargo.toml dependencies

### 2. Start Local Server
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

**Expected Output:**
- ✅ Server running on http://localhost:8000
- ✅ No CORS errors in console

### 3. Open Browser
Navigate to: http://localhost:8000

**Expected Output:**
- ✅ Page loads without errors
- ✅ No 404s in Network tab
- ✅ WASM module loads successfully

---

## Core Functionality Tests

### Test 1: WASM Module Loading

**Steps:**
1. Open browser DevTools (F12)
2. Check Console tab
3. Look for "PRIMUS Ready" message

**Expected Results:**
- ✅ "Loading WASM module..." appears
- ✅ "PRIMUS Ready" appears within 2 seconds
- ✅ Runtime status shows green "Ready"
- ✅ No error messages in console

**Failure Indicators:**
- ❌ "WASM module failed to load" error
- ❌ Red runtime status
- ❌ 404 error for .wasm file

**Fix:**
- Verify WASM build completed
- Check file paths in script.js
- Ensure server serves .wasm with correct MIME type

---

### Test 2: Navigation & Routing

**Steps:**
1. Click each navigation link
2. Verify URL hash changes
3. Verify content updates

**Routes to Test:**

#### Home (`#/`)
- ✅ Welcome message displays
- ✅ Quick start guide visible
- ✅ Agent cards render

#### Editor (`#/editor`)
- ✅ Code editor visible
- ✅ Syntax highlighting works
- ✅ Line numbers display
- ✅ Can type code

#### Terminal (`#/terminal`)
- ✅ Terminal prompt visible
- ✅ Can type commands
- ✅ Command history works (↑/↓ arrows)

#### WORM Chain (`#/worm`)
- ✅ WORM explorer loads
- ✅ Block list visible (or empty state)
- ✅ Detail panel visible

#### Proofs (`#/proofs`)
- ✅ Proof registry loads
- ✅ Filter buttons visible
- ✅ Stats display correctly

#### Agents (`#/agents`)
- ✅ Agent list displays
- ✅ Agent cards render
- ✅ Status indicators work

**Failure Indicators:**
- ❌ 404 or blank page
- ❌ JavaScript errors in console
- ❌ Content doesn't update

---

### Test 3: Code Editor

**Steps:**
1. Navigate to Editor (`#/editor`)
2. Type sample Autocode program
3. Test editor features

**Sample Code:**
```
+0 A
+1 B
-2 C
```

**Features to Test:**
- ✅ Syntax highlighting applies
- ✅ Line numbers increment
- ✅ Can select text
- ✅ Can copy/paste
- ✅ Undo/redo works (Ctrl+Z / Ctrl+Y)
- ✅ Tab key indents

**Expected Results:**
- ✅ Code displays with colors
- ✅ No lag when typing
- ✅ Cursor position accurate

---

### Test 4: Terminal Commands

**Steps:**
1. Navigate to Terminal (`#/terminal`)
2. Test each command type

**Commands to Test:**

#### Help Command
```
help
```
**Expected:**
- ✅ Command list displays
- ✅ Descriptions visible
- ✅ No errors

#### Parse Command
```
parse +0 A
```
**Expected:**
- ✅ Parsing output displays
- ✅ Token breakdown shown
- ✅ No errors

#### Compile Command
```
compile +0 A; +1 B; -2 C
```
**Expected:**
- ✅ Compilation output displays
- ✅ SUBLEQ code generated
- ✅ No errors

#### Run Command
```
run +0 A; +1 B; -2 C
```
**Expected:**
- ✅ Execution output displays
- ✅ Memory state shown
- ✅ No errors

#### Verify Command
```
verify +0 A
```
**Expected:**
- ✅ Verification output displays
- ✅ Proof status shown
- ✅ No errors

#### Clear Command
```
clear
```
**Expected:**
- ✅ Terminal clears
- ✅ Prompt remains
- ✅ No errors

**Command History:**
- ✅ Press ↑ to recall previous command
- ✅ Press ↓ to move forward in history
- ✅ History persists across sessions

---

### Test 5: WASM API Integration

**Steps:**
1. Open DevTools Console
2. Test WASM functions directly

**Functions to Test:**

#### Parse Function
```javascript
window.wasmModule.parse('+0 A')
```
**Expected:**
- ✅ Returns parsed result object
- ✅ No errors thrown

#### Compile Function
```javascript
window.wasmModule.compile('+0 A; +1 B')
```
**Expected:**
- ✅ Returns compiled SUBLEQ code
- ✅ No errors thrown

#### Execute Function
```javascript
window.wasmModule.execute('+0 A; +1 B')
```
**Expected:**
- ✅ Returns execution result
- ✅ Memory state included
- ✅ No errors thrown

#### Verify Function
```javascript
window.wasmModule.verify('+0 A')
```
**Expected:**
- ✅ Returns verification result
- ✅ Proof status included
- ✅ No errors thrown

---

### Test 6: WORM Chain

**Steps:**
1. Navigate to WORM Chain (`#/worm`)
2. Run commands to generate blocks
3. Verify chain integrity

**Test Sequence:**
1. Run: `compile +0 A`
2. Check WORM explorer
3. Run: `verify +0 A`
4. Check WORM explorer again

**Expected Results:**
- ✅ New blocks appear in chain
- ✅ Block numbers increment
- ✅ Hashes display correctly
- ✅ Timestamps accurate
- ✅ Chain status shows "Verified"
- ✅ Click block shows details

**Block Detail Panel:**
- ✅ Hash displays
- ✅ Previous hash displays
- ✅ Timestamp displays
- ✅ Data payload displays
- ✅ Copy buttons work

**Chain Verification:**
- ✅ Chain verifies successfully
- ✅ No integrity errors

---

### Test 7: Proof Registry

**Steps:**
1. Navigate to Proofs (`#/proofs`)
2. Run verification commands
3. Check proof display

**Test Sequence:**
1. Run: `verify +0 A`
2. Check proof registry
3. Test filters

**Expected Results:**
- ✅ New proofs appear in list
- ✅ Proof status displays correctly
- ✅ Timestamps accurate
- ✅ Click proof shows details

**Proof Detail Panel:**
- ✅ Theorem displays
- ✅ Prover displays
- ✅ Status badge displays
- ✅ Metadata displays
- ✅ Copy buttons work

**Filter Tests:**
- ✅ "All" shows all proofs
- ✅ "Verified" shows only verified
- ✅ "Pending" shows only pending
- ✅ "Failed" shows only failed

**Stats Display:**
- ✅ Total count correct
- ✅ Verified count correct
- ✅ Pending count correct
- ✅ Failed count correct

---

### Test 8: State Persistence

**Steps:**
1. Type code in editor
2. Run commands in terminal
3. Refresh page
4. Verify state restored

**Expected Results:**
- ✅ Editor content persists
- ✅ Terminal history persists
- ✅ Command history persists
- ✅ WORM chain persists
- ✅ Proofs persist
- ✅ UI preferences persist

**Test localStorage:**
```javascript
// Check saved state
console.log(localStorage.getItem('s-autocode-state'))
```

**Expected:**
- ✅ State object exists
- ✅ Contains editor, terminal, wormChain, proofs
- ✅ Timestamps accurate

---

### Test 9: Error Handling

**Steps:**
1. Test invalid inputs
2. Verify error messages display

**Error Scenarios:**

#### Invalid Syntax
```
parse invalid syntax here
```
**Expected:**
- ✅ Error toast appears
- ✅ Error message descriptive
- ✅ Terminal shows error

#### Empty Input
```
compile
```
**Expected:**
- ✅ Error toast appears
- ✅ Error message descriptive

#### WASM Failure (simulate)
1. Rename .wasm file temporarily
2. Refresh page

**Expected:**
- ✅ Error toast appears
- ✅ "WASM module failed to load" message
- ✅ Runtime status shows error

---

### Test 10: Agent System

**Steps:**
1. Navigate to Agents (`#/agents`)
2. Test agent interactions

**Agents to Test:**

#### FORGE (Compiler)
- ✅ Card displays
- ✅ Description accurate
- ✅ Status indicator works
- ✅ Can trigger compilation

#### SENTINEL (Verifier)
- ✅ Card displays
- ✅ Description accurate
- ✅ Status indicator works
- ✅ Can trigger verification

#### ORACLE (Optimizer)
- ✅ Card displays
- ✅ Description accurate
- ✅ Status indicator works

#### CODEX (Translator)
- ✅ Card displays
- ✅ Description accurate
- ✅ Status indicator works

#### VAULT (Archiver)
- ✅ Card displays
- ✅ Description accurate
- ✅ Status indicator works

---

## Performance Tests

### Test 11: Load Time

**Steps:**
1. Clear browser cache
2. Reload page
3. Measure load time

**Expected Results:**
- ✅ Initial HTML loads < 500ms
- ✅ WASM module loads < 2s
- ✅ Total page ready < 3s

**Tools:**
- Chrome DevTools → Network tab
- Lighthouse performance audit

---

### Test 12: Memory Usage

**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Run commands
4. Take another snapshot
5. Compare

**Expected Results:**
- ✅ No memory leaks
- ✅ Heap size stable
- ✅ No detached DOM nodes

---

### Test 13: Large Programs

**Steps:**
1. Load large Autocode program (100+ lines)
2. Compile and run
3. Monitor performance

**Expected Results:**
- ✅ Editor handles large files
- ✅ Compilation completes
- ✅ No browser freeze
- ✅ No errors

---

## Browser Compatibility Tests

### Test 14: Cross-Browser Testing

**Browsers to Test:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**For Each Browser:**
1. Load page
2. Test WASM loading
3. Test navigation
4. Test editor
5. Test terminal
6. Test WORM chain
7. Test proofs

**Expected:**
- ✅ All features work
- ✅ No browser-specific errors
- ✅ UI renders correctly

---

### Test 15: Mobile Responsiveness

**Devices to Test:**
- ✅ iPhone (Safari)
- ✅ Android (Chrome)
- ✅ Tablet (iPad)

**For Each Device:**
1. Load page
2. Test navigation
3. Test touch interactions
4. Test virtual keyboard

**Expected:**
- ✅ Layout responsive
- ✅ Touch targets adequate
- ✅ No horizontal scroll
- ✅ Virtual keyboard doesn't break layout

---

## Security Tests

### Test 16: XSS Prevention

**Steps:**
1. Try injecting script in editor
2. Try injecting script in terminal

**Test Inputs:**
```
<script>alert('XSS')</script>
```

**Expected:**
- ✅ Script doesn't execute
- ✅ Content escaped/sanitized
- ✅ No security warnings

---

### Test 17: localStorage Security

**Steps:**
1. Inspect localStorage
2. Verify no sensitive data

**Expected:**
- ✅ No passwords stored
- ✅ No API keys stored
- ✅ Only application state stored

---

## Deployment Tests

### Test 18: Production Build

**Steps:**
1. Build for production
2. Test minified version
3. Verify no console errors

**Expected:**
- ✅ All features work
- ✅ No console errors
- ✅ Assets load correctly

---

### Test 19: GitHub Pages Deployment

**Steps:**
1. Deploy to GitHub Pages
2. Test live URL
3. Verify all features

**Expected:**
- ✅ Page loads on live URL
- ✅ WASM loads correctly
- ✅ All routes work
- ✅ No 404 errors

---

## Final Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Documentation complete
- [ ] README updated
- [ ] LICENSE file present
- [ ] .gitignore configured

### Post-Deployment
- [ ] Live site accessible
- [ ] All features functional
- [ ] Analytics configured (optional)
- [ ] Error tracking configured (optional)
- [ ] Performance acceptable
- [ ] SEO optimized (optional)

---

## Test Results Template

```markdown
## Test Results - [Date]

**Tester:** [Name]
**Browser:** [Browser + Version]
**OS:** [Operating System]

### Core Functionality
- [ ] WASM Loading: PASS/FAIL
- [ ] Navigation: PASS/FAIL
- [ ] Editor: PASS/FAIL
- [ ] Terminal: PASS/FAIL
- [ ] WORM Chain: PASS/FAIL
- [ ] Proofs: PASS/FAIL
- [ ] State Persistence: PASS/FAIL

### Performance
- [ ] Load Time: [X]s
- [ ] Memory Usage: [X]MB
- [ ] Large Programs: PASS/FAIL

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Additional observations]
```

---

## Automated Testing (Future)

### Unit Tests
```bash
# Run Rust tests
cd src/wasm
cargo test

# Run JavaScript tests (if implemented)
npm test
```

### Integration Tests
```bash
# Run end-to-end tests (if implemented)
npm run test:e2e
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build WASM
        run: |
          cd src/wasm
          wasm-pack build --target web
      - name: Run tests
        run: npm test
```

---

## Troubleshooting Guide

### Common Issues

#### WASM Won't Load
**Symptoms:** "WASM module failed to load" error

**Solutions:**
1. Check WASM build: `ls pkg/`
2. Verify file paths in script.js
3. Check server MIME types
4. Clear browser cache

#### State Not Persisting
**Symptoms:** Data lost on refresh

**Solutions:**
1. Check localStorage quota
2. Verify browser allows localStorage
3. Check for JavaScript errors
4. Test in incognito mode

#### Performance Issues
**Symptoms:** Slow or laggy interface

**Solutions:**
1. Check browser DevTools → Performance
2. Reduce history size in state-manager.js
3. Optimize WASM build (release mode)
4. Check for memory leaks

#### Routing Not Working
**Symptoms:** URLs don't change or content doesn't update

**Solutions:**
1. Check routes.js configuration
2. Verify hash change listeners
3. Check for JavaScript errors
4. Test in different browser

---

## Contact & Support

**Issues:** https://github.com/snapkittywest/S-AUTOCODE/issues
**Docs:** See USER_GUIDE.md, API.md, BUILD.md
**Community:** [Discord/Forum link if available]

---

**Last Updated:** 2026-07-09
**Version:** 1.0.0