# S-AUTOCODE Build Guide

Complete instructions for building S-AUTOCODE from source.

---

## Prerequisites

### Required Tools

1. **Rust** (1.70 or later)
   ```bash
   # Install via rustup
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Or update existing installation
   rustup update stable
   
   # Verify installation
   rustc --version
   cargo --version
   ```

2. **wasm-pack** (for WASM builds)
   ```bash
   # Install wasm-pack
   cargo install wasm-pack
   
   # Verify installation
   wasm-pack --version
   ```

3. **Node.js** (18 or later, optional for local server)
   ```bash
   # Check version
   node --version
   npm --version
   ```

### Optional Tools

- **Python 3** - For simple HTTP server
- **Git** - For version control
- **VS Code** - Recommended editor

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/SNAPKITTYWEST/S-AUTOCODE.git
cd S-AUTOCODE

# Build WASM module
cd src/wasm
wasm-pack build --target web --out-dir ../../
cd ../..

# Build Rust workspace (optional)
cargo build --release --workspace

# Run local server
python -m http.server 8000
# Or: npx serve .

# Open browser
# Navigate to http://localhost:8000
```

---

## Detailed Build Instructions

### Step 1: Clone Repository

```bash
git clone https://github.com/SNAPKITTYWEST/S-AUTOCODE.git
cd S-AUTOCODE
```

### Step 2: Build WASM Module

The WASM module is the core of S-AUTOCODE and must be built before the application can run.

```bash
# Navigate to WASM crate
cd src/wasm

# Build for web target
wasm-pack build --target web --out-dir ../../

# This generates:
# - autocode_wasm.js
# - autocode_wasm_bg.wasm
# - autocode_wasm.d.ts (TypeScript definitions)
```

**Build Options:**

```bash
# Development build (faster, larger)
wasm-pack build --target web --dev --out-dir ../../

# Release build (slower, optimized)
wasm-pack build --target web --release --out-dir ../../

# With profiling
wasm-pack build --target web --profiling --out-dir ../../
```

**Output Files:**

| File | Size | Purpose |
|------|------|---------|
| `autocode_wasm.js` | ~20KB | JavaScript bindings |
| `autocode_wasm_bg.wasm` | ~75KB | WASM binary |
| `autocode_wasm.d.ts` | ~5KB | TypeScript definitions |

### Step 3: Build Rust Workspace (Optional)

Build all Rust crates for native execution:

```bash
# Return to project root
cd ../..

# Build all crates
cargo build --release --workspace

# Or build specific crates
cargo build --release -p autocode-compiler
cargo build --release -p autocode-emulator
cargo build --release -p autocode-optimizer
```

**Build Artifacts:**

```
target/release/
├── autocode-compiler
├── autocode-emulator
├── autocode-optimizer
└── libautocode_*.so
```

### Step 4: Run Tests

```bash
# Run all tests
cargo test --workspace

# Run tests for specific crate
cargo test -p autocode-compiler
cargo test -p autocode-emulator

# Run with output
cargo test --workspace -- --nocapture

# Run specific test
cargo test test_factorial
```

### Step 5: Run Local Server

S-AUTOCODE requires a web server to load WASM modules (due to CORS restrictions).

**Option 1: Python**
```bash
python -m http.server 8000
```

**Option 2: Node.js**
```bash
npx serve .
# Or install globally: npm install -g serve
```

**Option 3: Rust**
```bash
cargo install simple-http-server
simple-http-server -p 8000
```

**Option 4: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html`
- Select "Open with Live Server"

### Step 6: Open in Browser

Navigate to:
- http://localhost:8000 (Python/Rust)
- http://localhost:3000 (Node serve)
- http://127.0.0.1:5500 (VS Code Live Server)

---

## Build Configurations

### Development Build

Fast compilation, larger binaries, includes debug symbols:

```bash
cd src/wasm
wasm-pack build --target web --dev --out-dir ../../
```

**Characteristics:**
- Build time: ~30 seconds
- WASM size: ~150KB
- Includes debug info
- No optimizations

### Release Build

Optimized for production:

```bash
cd src/wasm
wasm-pack build --target web --release --out-dir ../../
```

**Characteristics:**
- Build time: ~2 minutes
- WASM size: ~75KB
- Fully optimized
- No debug info

### Profile Build

Optimized with debug symbols:

```bash
cd src/wasm
wasm-pack build --target web --profiling --out-dir ../../
```

**Characteristics:**
- Build time: ~1.5 minutes
- WASM size: ~100KB
- Optimized + debug info
- Good for profiling

---

## Workspace Structure

```
S-AUTOCODE/
├── Cargo.toml              # Workspace manifest
├── Cargo.lock              # Dependency lock file
├── src/
│   ├── compiler/           # Autocode compiler
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── autocode/   # Parser, AST, symbol table
│   │       └── backend/    # SUBLEQ, Manchester backends
│   ├── emulator/           # SUBLEQ & Manchester emulators
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── subleq/     # SUBLEQ machine
│   │       ├── manchester/ # Manchester Mark 1
│   │       └── comparative.rs
│   ├── optimizer/          # Drum latency optimizer
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── branch_analyzer.rs
│   │       ├── drum_model.rs
│   │       └── relocator.rs
│   ├── visualization/      # Memory maps, graphs
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── memory_map.rs
│   │       └── branch_graph.rs
│   └── wasm/               # WASM bindings
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
└── target/                 # Build artifacts
    ├── debug/
    ├── release/
    └── wasm32-unknown-unknown/
```

---

## Dependencies

### Workspace Dependencies

Defined in root `Cargo.toml`:

```toml
[workspace.dependencies]
rand = "0.8"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
clap = { version = "4.4", features = ["derive"] }
petgraph = "0.6"
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1.6", features = ["serde", "v4"] }
getrandom = { version = "0.2", features = ["js"] }
```

### WASM-Specific Dependencies

```toml
wasm-bindgen = "0.2"
js-sys = "0.3"
web-sys = { version = "0.3", features = [...] }
```

---

## Troubleshooting

### Issue: `wasm-pack` not found

**Solution:**
```bash
cargo install wasm-pack
```

### Issue: WASM build fails with "target not found"

**Solution:**
```bash
rustup target add wasm32-unknown-unknown
```

### Issue: CORS errors in browser

**Symptoms:**
- "Failed to load WASM module"
- "Cross-origin request blocked"

**Solution:**
Use a proper HTTP server (not `file://` protocol):
```bash
python -m http.server 8000
```

### Issue: `cargo build` fails

**Check Rust version:**
```bash
rustc --version
# Should be 1.70 or later
rustup update stable
```

**Clean and rebuild:**
```bash
cargo clean
cargo build --release
```

### Issue: Out of memory during build

**Solution:**
```bash
# Reduce parallel jobs
cargo build --release -j 2

# Or increase system swap
```

### Issue: WASM module too large

**Solution:**
```bash
# Use release build with optimizations
wasm-pack build --target web --release --out-dir ../../

# Check size
ls -lh autocode_wasm_bg.wasm
```

---

## Build Optimization

### Reduce WASM Size

Add to `src/wasm/Cargo.toml`:

```toml
[profile.release]
opt-level = "s"        # Optimize for size
lto = true             # Link-time optimization
codegen-units = 1      # Single codegen unit
strip = true           # Strip symbols
```

### Faster Builds

```toml
[profile.dev]
opt-level = 0          # No optimization
debug = true           # Include debug info
incremental = true     # Incremental compilation
```

### Parallel Builds

```bash
# Use all CPU cores
cargo build --release -j $(nproc)

# Or specify number
cargo build --release -j 4
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: Build and Test

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
        target: wasm32-unknown-unknown
    
    - name: Install wasm-pack
      run: cargo install wasm-pack
    
    - name: Build WASM
      run: |
        cd src/wasm
        wasm-pack build --target web --out-dir ../../
    
    - name: Build Workspace
      run: cargo build --release --workspace
    
    - name: Run Tests
      run: cargo test --workspace
    
    - name: Upload Artifacts
      uses: actions/upload-artifact@v3
      with:
        name: wasm-binaries
        path: |
          autocode_wasm.js
          autocode_wasm_bg.wasm
```

---

## Platform-Specific Notes

### Windows

```powershell
# Install Rust
# Download from https://rustup.rs/

# Install wasm-pack
cargo install wasm-pack

# Build
cd src\wasm
wasm-pack build --target web --out-dir ..\..\

# Run server
python -m http.server 8000
```

### macOS

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
cargo install wasm-pack

# Build
cd src/wasm
wasm-pack build --target web --out-dir ../../

# Run server
python3 -m http.server 8000
```

### Linux

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install dependencies (Ubuntu/Debian)
sudo apt-get install build-essential pkg-config libssl-dev

# Install wasm-pack
cargo install wasm-pack

# Build
cd src/wasm
wasm-pack build --target web --out-dir ../../

# Run server
python3 -m http.server 8000
```

---

## Performance Benchmarks

### Build Times

| Configuration | Time | Size |
|--------------|------|------|
| Dev | 30s | 150KB |
| Release | 2m | 75KB |
| Profile | 1.5m | 100KB |

### Runtime Performance

| Operation | Time |
|-----------|------|
| WASM Load | <100ms |
| Compile | <10ms |
| Execute (1K steps) | <1ms |
| Execute (100K steps) | <100ms |

---

## Next Steps

After building:

1. **Test the Application**
   - Open in browser
   - Try terminal commands
   - Test agent interactions

2. **Read Documentation**
   - USER_GUIDE.md
   - API.md
   - examples/README.md

3. **Deploy**
   - See DEPLOYMENT.md for deployment instructions

---

## Getting Help

- **Build Issues:** Check troubleshooting section above
- **Rust Help:** https://doc.rust-lang.org/
- **WASM Help:** https://rustwasm.github.io/
- **Project Issues:** https://github.com/SNAPKITTYWEST/S-AUTOCODE/issues

---

**Happy building!** 🛠️