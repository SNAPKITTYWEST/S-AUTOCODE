# Fortran-Only Sandbox

Use this prompt when analyzing legacy Fortran.

## System Prompt

Analyze the provided Fortran code.

Do not transpile it.

Map the original logic to equivalent modern Fortran 2008 or Fortran 2018.

You are prohibited from suggesting Rust, C, Python, JavaScript, or foreign-function-interface migration.

Keep the logic within the Fortran ecosystem.

Prefer:

- modules
- explicit interfaces
- pure procedures where possible
- allocatable arrays instead of unsafe fixed buffers
- `selected_int_kind` / `selected_real_kind`
- fpm-compatible project structure

Use AI only to explain intent and propose a Fortran-native modernization path.

## Static Analysis Flow

1. Compile with warnings.
2. Dump intermediate representation when useful.
3. Identify control flow.
4. Identify COMMON blocks, GOTOs, EQUIVALENCE, implicit typing.
5. Map each construct to modern Fortran.
6. Preserve numerical intent.
7. Write tests before rewriting.

## Tooling

- `gfortran` - GNU Fortran compiler
- `fpm` - Fortran Package Manager
- `LFortran` - Modern Fortran compiler
- `flint` / `fortls` - Linting and language server where useful

## Modernization Patterns

### COMMON Blocks → Modules

**Legacy:**
```fortran
      COMMON /MYDATA/ X, Y, Z
      REAL X, Y, Z
```

**Modern:**
```fortran
module mydata_mod
  implicit none
  real :: x, y, z
end module mydata_mod
```

### GOTO → Structured Control Flow

**Legacy:**
```fortran
      IF (X .LT. 0) GOTO 100
      Y = SQRT(X)
      GOTO 200
100   Y = 0.0
200   CONTINUE
```

**Modern:**
```fortran
if (x < 0.0) then
  y = 0.0
else
  y = sqrt(x)
end if
```

### Fixed Arrays → Allocatable

**Legacy:**
```fortran
      REAL A(1000)
```

**Modern:**
```fortran
real, allocatable :: a(:)
allocate(a(n))
! ... use a ...
deallocate(a)
```

### Implicit Typing → Explicit

**Legacy:**
```fortran
      FUNCTION CALC(X)
      CALC = X * 2.0
      END
```

**Modern:**
```fortran
function calc(x) result(res)
  implicit none
  real, intent(in) :: x
  real :: res
  res = x * 2.0
end function calc
```

## Numerical Stability

When modernizing numerical code:

1. **Preserve algorithm intent** - Don't change the mathematical approach
2. **Maintain precision** - Use `selected_real_kind` for portability
3. **Document assumptions** - Note any numerical properties
4. **Test thoroughly** - Compare results with legacy code
5. **Profile performance** - Ensure no regression

## Example: Modernizing a Legacy Subroutine

**Legacy (FORTRAN 77):**
```fortran
      SUBROUTINE SOLVE(N, A, B, X)
      IMPLICIT REAL*8 (A-H,O-Z)
      DIMENSION A(N,N), B(N), X(N)
      DO 10 I = 1, N
        X(I) = B(I)
        DO 20 J = 1, N
          IF (I .NE. J) THEN
            X(I) = X(I) - A(I,J) * X(J)
          ENDIF
20      CONTINUE
        X(I) = X(I) / A(I,I)
10    CONTINUE
      RETURN
      END
```

**Modern (Fortran 2008):**
```fortran
module solver_mod
  use iso_fortran_env, only: real64
  implicit none
  private
  public :: solve

contains

  subroutine solve(n, a, b, x)
    integer, intent(in) :: n
    real(real64), intent(in) :: a(n, n)
    real(real64), intent(in) :: b(n)
    real(real64), intent(out) :: x(n)
    integer :: i, j

    do i = 1, n
      x(i) = b(i)
      do j = 1, n
        if (i /= j) then
          x(i) = x(i) - a(i, j) * x(j)
        end if
      end do
      x(i) = x(i) / a(i, i)
    end do
  end subroutine solve

end module solver_mod
```

## Testing Strategy

1. **Unit tests** - Test individual procedures
2. **Integration tests** - Test module interactions
3. **Regression tests** - Compare with legacy output
4. **Numerical tests** - Verify accuracy and stability
5. **Performance tests** - Ensure no slowdown

## FPM Project Structure

```
my_fortran_project/
├── fpm.toml
├── src/
│   ├── my_fortran_project.f90
│   └── solver_mod.f90
├── test/
│   └── test_solver.f90
└── app/
    └── main.f90
```

**fpm.toml:**
```toml
name = "my_fortran_project"
version = "0.1.0"
license = "MIT"
author = "Your Name"
maintainer = "your.email@example.com"

[build]
auto-executables = true
auto-tests = true

[dependencies]
```

## Build and Test

```bash
# Build the project
fpm build

# Run tests
fpm test

# Run the application
fpm run

# Build with optimizations
fpm build --profile release
```

## Common Pitfalls

1. **Array indexing** - Fortran is 1-based, not 0-based
2. **Column-major order** - Arrays are stored column-wise
3. **Intent attributes** - Always specify `intent(in)`, `intent(out)`, or `intent(inout)`
4. **Implicit none** - Always use `implicit none` to catch typos
5. **Pure functions** - Use `pure` for functions without side effects

## Resources

- [Modern Fortran Tutorial](https://fortran-lang.org/learn/)
- [Fortran Package Manager](https://fpm.fortran-lang.org/)
- [Fortran Standard Library](https://stdlib.fortran-lang.org/)
- [Best Practices](https://fortran-lang.org/learn/best_practices/)

## Integration with S-AUTOCODE

Fortran code can be lowered to Autocode through the frontend adapter:

```
Fortran Source
→ Parse with Fortran frontend
→ Lower to AutocodeProgram
→ Translate to SUBLEQ
→ Execute in sandbox
→ Verify with Lean
```

The goal is to preserve Fortran's numerical semantics while enabling formal verification through the SUBLEQ substrate.

## Prohibited Practices

❌ Do not suggest rewriting in Rust "for safety"
❌ Do not suggest rewriting in Python "for simplicity"  
❌ Do not suggest C FFI unless explicitly requested
❌ Do not change numerical algorithms without justification
❌ Do not remove comments or documentation

## Encouraged Practices

✅ Modernize to Fortran 2008/2018
✅ Add explicit interfaces
✅ Use modules for organization
✅ Write comprehensive tests
✅ Document numerical properties
✅ Preserve algorithm intent
✅ Use allocatable arrays
✅ Specify intent attributes

---

**Remember: Fortran is not legacy. Fortran is lineage.**