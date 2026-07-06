import Translation

namespace Autocode.BackendEquivalence

open Autocode.Translation

def SubleqBackend := List SubleqInstr → List SubleqInstr
def ManchesterBackend := List SubleqInstr → List SubleqInstr

def subleqBackend : SubleqBackend := id
def manchesterBackend : ManchesterBackend := id

theorem backend_equivalence (instrs : List SubleqInstr) :
    subleqBackend instrs = manchesterBackend instrs := by
  simp [subleqBackend, manchesterBackend]

theorem backend_preserves_length (instrs : List SubleqInstr) :
    (subleqBackend instrs).length = instrs.length := by
  simp [subleqBackend]

end Autocode.BackendEquivalence
