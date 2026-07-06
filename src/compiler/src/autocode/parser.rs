use std::collections::HashMap;
use crate::autocode::symbol_table::SymbolTable;

#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Sign(Sign),
    Identifier(String),
    Arrow,
    Number(i32),
    Eof,
}

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
    current_line: usize,
    current_col: usize,
}

impl Parser {
    pub fn new(source: &str) -> Self {
        Self {
            input: source.chars().collect(),
            pos: 0,
            current_line: 1,
            current_col: 1,
        }
    }

    fn peek(&self) -> Option<char> {
        self.input.get(self.pos).copied()
    }

    fn advance(&mut self) -> Option<char> {
        let ch = self.peek()?;
        self.pos += 1;
        if ch == '\n' {
            self.current_line += 1;
            self.current_col = 1;
        } else {
            self.current_col += 1;
        }
        Some(ch)
    }

    fn skip_whitespace(&mut self) {
        while let Some(ch) = self.peek() {
            if ch.is_whitespace() {
                self.advance();
            } else {
                break;
            }
        }
    }

    fn skip_comment(&mut self) {
        self.skip_whitespace();
        if self.peek() == Some('#') {
            while let Some(ch) = self.peek() {
                if ch == '\n' { self.advance(); break; }
                self.advance();
            }
            self.skip_whitespace();
        }
    }

    fn parse_identifier(&mut self) -> Option<String> {
        self.skip_whitespace();
        let mut ident = String::new();
        while let Some(ch) = self.peek() {
            if ch.is_alphanumeric() || ch == '_' {
                ident.push(self.advance()?);
            } else {
                break;
            }
        }
        if ident.is_empty() { None } else { Some(ident) }
    }

    pub fn parse_statement(&mut self, symtab: &mut SymbolTable) -> Option<Statement> {
        self.skip_comment();
        if self.peek().is_none() { return None; }

        let mut terms = Vec::new();

        loop {
            self.skip_comment();
            let sign = match self.peek()? {
                '+' => { self.advance(); Sign::Plus }
                '-' => { self.advance(); Sign::Minus }
                _ => return None,
            };

            let ident = self.parse_identifier()?;
            symtab.register(&ident);
            terms.push(Term { sign, identifier: ident });

            self.skip_comment();
            if self.peek() != Some('+') && self.peek() != Some('-') {
                break;
            }
        }

        self.skip_comment();
        if self.peek() != Some('-') { return None; }
        self.advance();
        if self.peek() != Some('>') { return None; }
        self.advance();

        let target = self.parse_identifier()?;
        symtab.register(&target);

        Some(Statement { terms, target })
    }

    pub fn parse_all(&mut self, symtab: &mut SymbolTable) -> Vec<Statement> {
        let mut stmts = Vec::new();
        loop {
            self.skip_comment();
            if self.peek().is_none() { break; }
            if let Some(stmt) = self.parse_statement(symtab) {
                stmts.push(stmt);
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
