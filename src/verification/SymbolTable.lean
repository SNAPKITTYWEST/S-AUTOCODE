import Parser

namespace Autocode.SymbolTable

structure SymbolEntry where
  name : String
  address : Nat
  line : Nat

def SymbolTable := List SymbolEntry

def emptyTable : SymbolTable := []

def lookup (name : String) (table : SymbolTable) : Option SymbolEntry :=
  table.find? (fun e => e.name == name)

def insert (entry : SymbolEntry) (table : SymbolTable) : SymbolTable :=
  entry :: table

theorem lookup_insert_head (entry : SymbolEntry) (table : SymbolTable) :
    lookup entry.name (insert entry table) = some entry := by
  simp [lookup, insert, List.find?]

theorem lookup_insert_miss (entry : SymbolEntry) (table : SymbolTable)
    (name : String) (h : entry.name ≠ name) :
    lookup name (insert entry table) = lookup name table := by
  simp [lookup, insert]
  congr 1
  funext e
  simp [BEq.beq]
  split
  · next heq => contradiction
  · rfl

end Autocode.SymbolTable
