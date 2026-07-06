namespace Autocode.Parsing

inductive Token where
  | sign : Sign → Token
  | number : Nat → Token
  | identifier : String → Token
  | operator : String → Token
  | eol : Token

inductive Sign where
  | plus | minus
  deriving DecidableEq

structure SignedNumber where
  sign : Sign
  value : Nat
  deriving DecidableEq

def Sign.negate : Sign → Sign
  | Sign.plus => Sign.minus
  | Sign.minus => Sign.plus

theorem Sign.negate_negate (s : Sign) : s.negate.negate = s := by
  cases s <;> rfl

def tokenize (input : String) : List Token :=
  input.splitOn "\n" |>.map (fun line =>
    Token.eol :: line.splitOn " " |>.map (fun word =>
      if word.startsWith "+" then Token.sign Sign.plus
      else if word.startsWith "-" then Token.sign Sign.minus
      else Token.identifier word))

def parseSigned (tokens : List Token) : List SignedNumber :=
  match tokens with
  | [] => []
  | Token.sign s :: Token.number n :: rest => { sign := s, value := n } :: parseSigned rest
  | _ :: rest => parseSigned rest

theorem parseSigned_length_le (tokens : List Token) :
    (parseSigned tokens).length ≤ tokens.length := by
  induction tokens with
  | nil => simp [parseSigned]
  | cons h t ih =>
    simp [parseSigned]
    cases h <;> simp [parseSigned]
    split <;> simp [List.length_cons, Nat.succ_le_succ, ih]

end Autocode.Parsing
