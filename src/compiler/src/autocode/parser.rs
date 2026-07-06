use crate::autocode::symbol_table::SymbolTable;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Sign {
    Plus,
    Minus,
}

#[derive(Debug, Clone)]
pub struct Statement {
    pub terms: Vec<Term>,
    pub target: String,
}

#[derive(Debug, Clone)]
pub struct Term {
    pub sign: Sign,
    pub identifier: String,
}

pub struct Parser {
    input: Vec<char>,
    pos: usize,
}

impl Parser {
    pub fn new(source: &str) -> Self {
        Self {
            input: source.chars().collect(),
            pos: 0,
        }
    }

    fn peek(&self) -> Option<char> {
        self.input.get(self.pos).copied()
    }

    fn advance(&mut self) -> Option<char> {
        let ch = self.peek()?;
        self.pos += 1;
        Some(ch)
    }

    fn skip_whitespace(&mut self) {
        while let Some(ch) = self.peek() {
            if ch.is_whitespace() || ch == '#' {
                if ch == '#' {
                    while let Some(c) = self.peek() {
                        if c == '\n' { self.advance(); break; }
                        self.advance();
                    }
                } else {
                    self.advance();
                }
            } else {
                break;
            }
        }
    }

    fn parse_number(&mut self) -> Option<i32> {
        self.skip_whitespace();
        let mut num_str = String::new();
        while let Some(ch) = self.peek() {
            if ch.is_ascii_digit() {
                num_str.push(self.advance()?);
            } else {
                break;
            }
        }
        if num_str.is_empty() { None } else { num_str.parse().ok() }
    }

    fn parse_sign(&mut self) -> Option<Sign> {
        self.skip_whitespace();
        match self.peek()? {
            '+' => { self.advance(); Some(Sign::Plus) }
            '-' => { self.advance(); Some(Sign::Minus) }
            _ => None,
        }
    }

    pub fn parse_line(&mut self, symtab: &mut SymbolTable) -> Option<(Sign, i32, i32)> {
        self.skip_whitespace();
        if self.peek().is_none() { return None; }

        let sign = self.parse_sign()?;
        let addr = self.parse_number()? as usize;
        let value = self.parse_number()?;
        let next = self.parse_number()? as usize;

        symtab.register(&format!("mem_{}", addr));
        symtab.register(&format!("mem_{}", addr + 1));
        symtab.register(&format!("mem_{}", next));

        Some((sign, value, next as i32))
    }

    pub fn parse_all(&mut self, symtab: &mut SymbolTable) -> Vec<Statement> {
        let mut stmts = Vec::new();
        loop {
            self.skip_whitespace();
            if self.peek().is_none() { break; }

            if let Some((sign, _value, _next)) = self.parse_line(symtab) {
                let target = format!("mem_{}", _next as usize);
                let terms = vec![Term {
                    sign,
                    identifier: format!("mem_{}", _next as usize - 1),
                }];
                stmts.push(Statement { terms, target });
            } else {
                while let Some(ch) = self.peek() {
                    if ch == '\n' { self.advance(); break; }
                    self.advance();
                }
            }
        }
        stmts
    }
}
