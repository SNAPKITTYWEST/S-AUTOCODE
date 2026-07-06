import BackendEquivalence

namespace Autocode.Relocation

structure RelocationMap where
  forward : Nat → Nat
  backward : Nat → Nat

def identityReloc : RelocationMap where
  forward := id
  backward := id

theorem identity_preserves (m : RelocationMap) (addr : Nat) :
    m.forward (m.backward addr) = addr := by
  simp [RelocationMap.forward, RelocationMap.backward]
  sorry

theorem relocation_is_injective (m : RelocationMap) (a b : Nat)
    (h : m.forward a = m.forward b) : a = b := by
  sorry

end Autocode.Relocation
