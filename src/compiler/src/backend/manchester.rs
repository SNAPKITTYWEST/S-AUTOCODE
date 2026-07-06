use crate::autocode::{Statement, Term, Sign};
use crate::autocode::symbol_table::{SymbolTable, Address};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ManchesterOrder {
    Add(usize, usize),
    Sub(usize, usize),
    Load(usize, usize),
    Store(usize, usize),
    Jump(usize),
    JumpNeg(usize),
    Read(usize),
    Print(usize),
    Stop,
}

pub struct ManchesterBackend {
    orders: Vec<ManchesterOrder>,
    symtab: SymbolTable,
    acc: Option<Address>,
}

impl ManchesterBackend {
    pub fn new(symtab: SymbolTable) -> Self {
        Self { orders: Vec::new(), symtab, acc: None }
    }

    fn ensure_loaded(&mut self, addr: Address) {
        if self.acc != Some(addr) {
            self.orders.push(ManchesterOrder::Load(addr.0, addr.0));
            self.acc = Some(addr);
        }
    }

    fn ensure_stored(&mut self, addr: Address) {
        if self.acc == Some(addr) {
            self.orders.push(ManchesterOrder::Store(addr.0, addr.0));
        }
    }

    pub fn translate(&mut self, stmts: &[Statement]) -> Vec<ManchesterOrder> {
        for stmt in stmts {
            let target = self.symtab.resolve(&stmt.target).unwrap();
            if stmt.terms.is_empty() { continue; }

            let first = &stmt.terms[0];
            let src = self.symtab.resolve(&first.identifier).unwrap();
            match first.sign {
                Sign::Plus => {
                    self.ensure_loaded(src);
                    self.acc = Some(target);
                }
                Sign::Minus => {
                    self.ensure_loaded(src);
                    self.orders.push(ManchesterOrder::Sub(src.0, src.0));
                    self.acc = Some(target);
                }
            }

            for term in &stmt.terms[1..] {
                let src = self.symtab.resolve(&term.identifier).unwrap();
                match term.sign {
                    Sign::Plus => {
                        self.ensure_loaded(target);
                        self.orders.push(ManchesterOrder::Add(src.0, target.0));
                    }
                    Sign::Minus => {
                        self.ensure_loaded(target);
                        self.orders.push(ManchesterOrder::Sub(src.0, target.0));
                    }
                }
            }
            self.ensure_stored(target);
        }
        self.orders.push(ManchesterOrder::Stop);
        self.orders.clone()
    }
}
