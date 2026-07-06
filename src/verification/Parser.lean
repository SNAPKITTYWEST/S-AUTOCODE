import Parser
namespace Autocode.Parser.Theorems

open Autocode.Parsing

theorem parse_signed_never_empty (tokens : List Token)
    (h : tokens.length > 0) :
    (parseSigned tokens).length ≤ tokens.length := by
  exact parseSigned_length_le tokens

theorem negate_is_involutive : ∀ s : Sign, s.negate.negate = s := by
  intro s
  cases s <;> rfl

end Autocode.Parser.Theorems
