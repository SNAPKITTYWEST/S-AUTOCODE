use crate::autocode::symbol_table::SymbolTable;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SubleqInstr {
    pub a: usize,
    pub b: usize,
    pub c: usize,
}

pub struct SubleqBackend {
    instructions: Vec<SubleqInstr>,
}

impl SubleqBackend {
    pub fn new(_symtab: SymbolTable) -> Self {
        Self { instructions: Vec::new() }
    }

    pub fn emit(&mut self, a: usize, b: usize, c: usize) {
        self.instructions.push(SubleqInstr { a, b, c });
    }

    pub fn translate_from_source(&mut self, source: &str) -> Vec<SubleqInstr> {
        for line in source.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') { continue; }

            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() < 3 { continue; }

            let sign = parts[0].chars().next().unwrap();
            let addr: usize = parts[0][1..].parse().unwrap_or(0);
            let _value: i32 = parts[1].parse().unwrap_or(0);
            let next: usize = parts[2].parse().unwrap_or(0);

            match sign {
                '+' => self.emit(addr, addr + 1, next),
                '-' => self.emit(addr, addr + 1, next),
                _ => {}
            }
        }
        self.instructions.clone()
    }

    pub fn get_instructions(&self) -> &[SubleqInstr] {
        &self.instructions
    }
}
