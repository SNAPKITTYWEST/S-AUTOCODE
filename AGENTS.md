# S-AUTOCODE Agent Rules

Agents working on this repository must obey the root substrate rule.

## Root Substrate Rule

Every language frontend must lower into:

1. Sign-Prefixed Linear Autocode
2. SUBLEQ unified memory tape
3. Deterministic execution trace
4. Verification witness

Agents may not skip the substrate.

## Fortran-Only Rule

When analyzing Fortran:

- Do not transpile to Rust, C, Python, or JavaScript.
- Do not suggest FFI unless explicitly requested.
- Preserve Fortran semantics inside Fortran.
- Prefer modern Fortran 2008/2018 mappings.
- Use static analysis to explain intent before rewriting.
- Keep numerical behavior stable.

## No Vendor-Code Rule

Agents must not copy proprietary IDE internals, private binaries, leaked prompts, credentials, or closed-source assets.

Allowed sources:

- public documentation
- open-source code under compatible license
- user-authored code
- clean-room implementation notes
- historical computing references

## Contributor Signature

Every agent handoff must include:

```
Implemented-by: [Agent Name/ID]
Reviewed-by: [Reviewer]
Checked-by: [Verification Tool]
Sealed-by: [Cryptographic Hash]
Human-Authority: [Human Approver]
Receipt-Hash: [SHA-256]
```

## Code Quality Standards

### Rust Code

- Use `cargo fmt` and `cargo clippy`
- Write tests for all public APIs
- Document public functions with `///` comments
- Use `Result<T, E>` for fallible operations
- Avoid `unwrap()` in production code
- Prefer explicit error types over `anyhow::Error` in libraries

### Lean 4 Code

- All theorems must have explicit type signatures
- Use `sorry` only in proof bodies, never in statements
- Document proof strategies with comments
- Use `mathlib4` conventions
- Prefer constructive proofs over classical when possible

### Documentation

- Keep README.md up to date
- Document architectural decisions in `docs/`
- Include usage examples
- Explain historical context where relevant

## Self-Modifying Code Ethics

Self-modifying code in this repository is permitted **only** for:

1. Historical computing research
2. Compiler verification research
3. Formal methods development
4. Educational purposes
5. Emulator development

Self-modifying code must **never** be used for:

1. Malware development
2. Security evasion
3. Obfuscation for malicious purposes
4. Unauthorized code execution
5. Bypassing security controls

All self-modifying code must:
- Execute in a sandbox
- Be fully traceable
- Generate verification witnesses
- Be deterministic
- Respect memory bounds

## Verification Requirements

Before merging code:

1. All tests must pass (`cargo test`)
2. Code must compile without warnings
3. Lean proofs must check (where applicable)
4. Documentation must be updated
5. Examples must run successfully
6. Self-modification reports must be clean

## Communication Standards

### Issue Reports

Include:
- Minimal reproducible example
- Expected behavior
- Actual behavior
- System information
- Relevant logs

### Pull Requests

Include:
- Clear description of changes
- Rationale for approach
- Test coverage
- Documentation updates
- Breaking changes noted

### Code Reviews

Focus on:
- Correctness
- Safety
- Performance
- Maintainability
- Documentation

## Historical Accuracy

When implementing historical systems (Manchester Mark 1, early Autocode):

- Cite primary sources
- Document deviations from historical behavior
- Preserve original semantics where possible
- Note modernizations explicitly

## Substrate Integrity

The SUBLEQ substrate is sacred. Changes to the core execution model require:

1. Formal proof that semantics are preserved
2. Comparative execution tests
3. Verification witness validation
4. Documentation of rationale
5. Human approval

## Lean 4 Integration

When adding Lean proofs:

- Use `lakefile.lean` for build configuration
- Import from `mathlib4` when possible
- Document proof obligations clearly
- Link Rust code to Lean theorems via comments
- Generate proof witnesses from execution traces

## Frontend Development

When adding a new language frontend:

- Create module in `src/frontends/`
- Implement `Frontend` trait
- Lower to `AutocodeProgram`
- Write comprehensive tests
- Document syntax mapping
- Provide examples

## Security

- Never commit credentials
- Use `.gitignore` properly
- Sanitize user input
- Validate all memory accesses
- Bound all loops
- Check all array indices

## Performance

- Profile before optimizing
- Document performance characteristics
- Use benchmarks for critical paths
- Prefer clarity over micro-optimizations
- Note algorithmic complexity

## Licensing

- Respect all licenses
- Document dependencies
- Use compatible licenses
- Attribute properly
- Keep LICENSE file updated

## Questions?

Open an issue or discussion. Human maintainers will respond.

---

**Remember: Many syntaxes → One substrate → Verified execution → Sealed receipt**