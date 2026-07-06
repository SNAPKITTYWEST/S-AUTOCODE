import SymbolTable

namespace Autocode.Translation

open Autocode.Parsing
open Autocode.SymbolTable

structure SubleqInstr where
  a : Nat
  b : Nat
  c : Nat

def Statement := Nat

def translate (stmts : List Statement) (table : SymbolTable) : List SubleqInstr :=
  stmts.map fun addr => { a := addr, b := addr + 1, c := addr + 2 }

theorem translate_length (stmts : List Statement) (table : SymbolTable) :
    (translate stmts table).length = stmts.length := by
  simp [translate, List.length_map]

end Autocode.Translation
