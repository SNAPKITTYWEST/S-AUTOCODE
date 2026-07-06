use crate::autocode::{Statement, Term, Sign};
use crate::autocode::symbol_table::{SymbolTable, Address};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SubleqInstr {
    pub a: usize,
    pub b: usize,
    pub c: usize,
}

pub struct SubleqBackend {
    instructions: Vec<SubleqInstr>,
    symtab: SymbolTable,
    temp_counter: usize,
}

impl SubleqBackend {
    pub fn new(mut symtab: SymbolTable) -> Self {
        let temp_base = symtab.next_address;
        symtab.next_address += 64;
        Self {
            instructions: Vec::new(),
            symtab,
            temp_counter: temp_base,
        }
    }

    fn new_temp(&mut self) -> Address {
        let addr = Address(self.temp_counter);
        self.temp_counter += 1;
        addr
    }

    fn emit(&mut self, a: Address, b: Address, c: Address) {
        self.instructions.push(SubleqInstr { a: a.0, b: b.0, c: c.0 });
    }

    fn emit_clear(&mut self, dest: Address) {
        self.emit(dest, dest, Address(self.instructions.len() + 1));
    }

    fn emit_copy(&mut self, src: Address, dest: Address) {
        self.emit_clear(dest);
        let temp = self.new_temp();
        self.emit_clear(temp);
        self.emit(src, temp, Address(self.instructions.len() + 1));
        self.emit(temp, dest, Address(self.instructions.len() + 1));
    }

    fn emit_add(&mut self, src: Address, dest: Address) {
        let temp = self.new_temp();
        self.emit_clear(temp);
        self.emit(src, temp, Address(self.instructions.len() + 1));
        self.emit(temp, dest, Address(self.instructions.len() + 1));
    }

    fn emit_sub(&mut self, src: Address, dest: Address) {
        self.emit(src, dest, Address(self.instructions.len() + 1));
    }

    fn emit_neg(&mut self, dest: Address) {
        let temp = self.new_temp();
        self.emit_clear(temp);
        self.emit(dest, temp, Address(self.instructions.len() + 1));
        self.emit_clear(dest);
        self.emit(temp, dest, Address(self.instructions.len() + 1));
    }

    pub fn translate(&mut self, stmts: &[Statement]) -> Vec<SubleqInstr> {
        for stmt in stmts {
            let target = self.symtab.resolve(&stmt.target).unwrap();
            if stmt.terms.is_empty() { continue; }

            let first = &stmt.terms[0];
            let src = self.symtab.resolve(&first.identifier).unwrap();
            match first.sign {
                Sign::Plus => self.emit_copy(src, target),
                Sign::Minus => {
                    self.emit_copy(src, target);
                    self.emit_neg(target);
                }
            }

            for term in &stmt.terms[1..] {
                let src = self.symtab.resolve(&term.identifier).unwrap();
                match term.sign {
                    Sign::Plus => self.emit_add(src, target),
                    Sign::Minus => self.emit_sub(src, target),
                }
            }
        }
        self.instructions.clone()
    }
}
