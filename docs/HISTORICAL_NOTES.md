# Historical Notes

## Manchester Mark 1 (1948-1951)

The Manchester Mark 1 was one of the earliest stored-program computers,
developed at the University of Manchester. It featured:
- Williams-Kilburn CRT tube memory (later replaced by magnetic drum)
- 32-bit word length
- ~960 instructions per second on the CRT version
- Williams tube stored bits as phosphor dots on a CRT screen

### The Drum Problem

When the Manchester Mark 1 transitioned from CRT to magnetic drum storage,
programs suffered from rotational latency. The drum rotated at a fixed speed,
and accessing data at different physical locations required waiting for the
drum to rotate to the correct position. This was the original motivation for
the SUBLEQ optimizer.

## SUBLEQ (One-Instruction Set Computer)

SUBLEQ (Subtract and Branch if Less than or Equal to Zero) is the simplest
possible instruction set:
```
SUBLEQ A, B, C   ; Mem[B] -= Mem[A]; if Mem[B] <= 0 then goto C
```

This single instruction is Turing-complete. The SUBLEQ architecture was
proposed by A. O. P. Solis in 1972 as a theoretical curiosity, but it
represents the absolute minimum hardware for computation.

## Sign-Prefixed Autocode

Sign-prefixed Autocode uses `+` and `-` to indicate memory operations:
- `+addr value next` : Subtract value from Mem[addr], jump to next
- `-addr value next` : Subtract value, conditional branch on result

This syntax maps directly to SUBLEQ with zero overhead — no parser
complexity, no AST construction, no semantic analysis. The compiler is
a single pass that emits instructions as it reads tokens.
